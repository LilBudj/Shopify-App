require('isomorphic-fetch');
const dotenv = require('dotenv');
const Koa = require('koa');
const cors = require('koa-cors');
const KoaRouter = require('koa-router');
const koaBody = require('koa-body');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    server: {
        socketOptions: {keepAlive: 100000}
    }
}, (err) => {
    if (err) {
        console.log('Some problem occurred' + err)
    } else {
        console.log('Connection established')
    }
});

const next = require('next');
const lusca = require('koa-lusca');
const {default: createShopifyAuth} = require('@shopify/koa-shopify-auth');
const {verifyRequest} = require('@shopify/koa-shopify-auth');
const session = require('koa-session');
const axios = require('axios');
const request = require('request-promise');

dotenv.config();

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

const port = process.env.PORT || 8000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({dev});
const handle = app.getRequestHandler();

const {default: graphQLProxy} = require('@shopify/koa-shopify-graphql-proxy');
const {ApiVersion} = require('@shopify/koa-shopify-graphql-proxy');
const {SHOPIFY_API_SECRET_KEY, SHOPIFY_API_KEY} = process.env;

const server = new Koa();
const router = new KoaRouter();

const bannerSchema = new mongoose.Schema({
    id: Number,
    shop: String,
    name: String,
    startDate: {start: String},
    endDate: {end: String},
    position: String,
    sticky: Boolean,
    backGroundColor: {
        hue: Number,
        saturation: Number,
        brightness: Number,
        alpha: Number
    },
    borderSize: Number,
    borderColor: {
        hue: Number,
        saturation: Number,
        brightness: Number,
        alpha: Number
    }
});
let BannerConfig = mongoose.model('bannerConfig', bannerSchema);

const modelDecoder = (ctx, t) => {
    let local = {
        dataEraser(data) {
            this.data = data
        }
    };
    BannerConfig.find({shop: ctx.cookies.get('shopOrigin')}, (err, result) => {
        if (err) console.log(err);
        else local.dataEraser(result)
    });
    if (local.data.isArray) {
        return local.data.find(e => e.id === t.id)
    } else return local.data
};

router.get('/api/script', async (ctx) => {
    try {
        let res = await axios.get(
            `https://${ctx.cookies.get('shopOrigin')}/admin/api/2020-04/script_tags.json`,
            {
                headers: {
                    "X-Shopify-Access-Token": ctx.cookies.get('accessToken')
                }
            });
        ctx.body = {
            status: 'success',
            config: res.data.script_tags.some(t => t.src === 'https://lil-shopify.herokuapp.com/script.js'),
            script: (!!res.data.script_tags
                .filter(t => t.src === 'https://lil-shopify.herokuapp.com/script.js').length) ? res.data.script_tags
                .filter(t => t.src === 'https://lil-shopify.herokuapp.com/script.js')
                .map(t => {
                    return {
                        ...t,
                        configData: modelDecoder(ctx, t)
                    }
                }) : null
            ,
            message: ctx.cookies.get('shopOrigin')
        }
    } catch (e) {
        console.log(e)
    }
});
router.post('/api/script', koaBody(), async (ctx) => {
    try {
        const body = ctx.request.body;
        axios.post(`https://${ctx.cookies.get('shopOrigin')}/admin/api/2020-04/script_tags.json`, {
            "script_tag": {
                "event": "onload",
                "src": "https://lil-shopify.herokuapp.com/script.js",
                "display_scope": "all"
            }
        }, {
            headers: {
                "X-Shopify-Access-Token": ctx.cookies.get('accessToken')
            }
        })
            .then(res => {
                console.log(res);
                let customConfig = new BannerConfig({
                    ...body,
                    id: res.data.script_tag.id,
                    shop: ctx.cookies.get('shopOrigin'),
                });
                customConfig.save().catch(e => console.log(e))
            });
        ctx.body = {message: 'Config added'}
    } catch (e) {
        console.log(e)
    }
});
router.delete('/api/script', koaBody(), async (ctx) => {
    try {
        BannerConfig.findOne({shop: ctx.cookies.get('shopOrigin')}, (err, res) => {
            if (err) console.log(err);
            else {
                BannerConfig.deleteOne(res, (err) => console.log(err));
                axios.delete(`https://${ctx.cookies.get('shopOrigin')}/admin/api/2020-04/script_tags/${res.id}.json`, {
                    headers: {
                        "X-Shopify-Access-Token": ctx.cookies.get('accessToken')
                    }
                }).then(res => console.log(res));
            }
        });
        ctx.body = 'Timer deleted'
    } catch (e) {
        console.log(e)
    }
});

server.use(router.allowedMethods());
server.use(router.routes());
server.use(cors());

app.prepare().then(() => {

    server.use(session({secure: true, sameSite: 'none'}, server));
    server.keys = [SHOPIFY_API_SECRET_KEY];
    server.use(
        createShopifyAuth({
            apiKey: SHOPIFY_API_KEY,
            secret: SHOPIFY_API_SECRET_KEY,
            scopes: ['read_products', 'write_products', 'read_script_tags', 'write_script_tags'],
            afterAuth(ctx) {
                const {shop, accessToken} = ctx.session;
                ctx.cookies.set('shopOrigin', shop, {
                    httpOnly: false,
                    secure: true,
                    sameSite: 'none'
                });
                ctx.cookies.set('accessToken', accessToken, {
                    httpOnly: false,
                    secure: true,
                    sameSite: 'none'
                });
                ctx.redirect('/');
            }
        })
    );

    server.use(graphQLProxy({version: ApiVersion.January20}));
    server.use(verifyRequest());

    server.use(async (ctx) => {
        await handle(ctx.req, ctx.res);
        ctx.respond = false;
        ctx.res.statusCode = 200;
    });


    server.listen(port, () => {
        console.log(`App is ready on port ${port}`)
    });
});

