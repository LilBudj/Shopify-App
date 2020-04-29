import axios from "axios";

require('isomorphic-fetch');
const dotenv = require('dotenv');
const Koa = require('koa');
const cors = require('koa-cors');
const KoaRouter = require('koa-router');
const koaBody = require('koa-body');
const next = require('next');
const lusca = require('koa-lusca');
const {default: createShopifyAuth} = require('@shopify/koa-shopify-auth');
const {verifyRequest} = require('@shopify/koa-shopify-auth');
const session = require('koa-session');

dotenv.config();

const port = process.env.PORT || 8000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({dev});
const handle = app.getRequestHandler();

const { default: graphQLProxy } = require('@shopify/koa-shopify-graphql-proxy');
const {ApiVersion} = require('@shopify/koa-shopify-graphql-proxy');
const { SHOPIFY_API_SECRET_KEY, SHOPIFY_API_KEY} = process.env;

const server = new Koa();
const router = new KoaRouter();

const local = [];

router.get('/api/scripts', async (ctx) => {
    try {
        ctx.body = {
            status: 'success',
            data: {
                ...local[0]
            }
        }
    }
    catch (e) {
        console.log(e)
    }
});
router.post('/api/scripts', koaBody(), async (ctx) => {
    try {
        const body = ctx.request.body;
        //storage.includeScript(body);
        local.push(body);
        ctx.body = 'Config added'
    }
    catch (e) {
        console.log(e)
    }
});
router.delete('/api/scripts', koaBody(), async (ctx) => {
    try{
        local.pop();
        ctx.body = 'Timer deleted'
    }
    catch (e) {
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
            scopes: ['read_products','write_products','read_script_tags','write_script_tags'],
            afterAuth(ctx){
                const {shop, accessToken} = ctx.session;
                ctx.cookies.set('shopOrigin', shop, {
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

    axios.get('https://nahku-b-tahke.myshopify.com/admin/api/2020-04/script_tags.json').then(res => {local.push(res.data)})

    server.listen(port, () => {
        console.log(`App is ready on port ${port}`)
    });
});

