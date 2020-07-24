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
const {default: createShopifyAuth} = require('@shopify/koa-shopify-auth');
const {verifyRequest} = require('@shopify/koa-shopify-auth');
const session = require('koa-session');
const axios = require('axios');
const DBAccess = require('./dbAccess');
const rep = require('./repository');
const end = require('./endpoints');

dotenv.config();

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

const port = process.env.PORT || 8000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({dev});
const handle = app.getRequestHandler();

const {default: graphQLProxy} = require('@shopify/koa-shopify-graphql-proxy');
const {ApiVersion} = require('@shopify/koa-shopify-graphql-proxy');
const {receiveWebhook, registerWebhook} = require('@shopify/koa-shopify-webhooks');
const {SHOPIFY_API_SECRET_KEY, SHOPIFY_API_KEY, HOST} = process.env;

const server = new Koa();
const router = new KoaRouter();

let {BannerConfig, BadgeConfig, AnimationConfig} = DBAccess;

const getter = rep.getter;

const {getEndpoint, postEndpoint, putEndpoint, deleteEndpoint} = end;

router.get('/api/script', getEndpoint({
    Config: BannerConfig,
    file: 'script.js'
}));
router.get('/api/badge', getEndpoint({
    Config: BadgeConfig,
    file: 'badge.js'
}));
router.get('/api/animation', getEndpoint({
    Config: AnimationConfig,
    file: 'animation.js'
}));
router.post('/api/script', koaBody(), postEndpoint({
    Config: BannerConfig,
    file: 'script.js'
}));
router.post('/api/badge', koaBody(), postEndpoint({
    Config: BadgeConfig,
    file: 'badge.js'
}));
router.post('/api/animation', koaBody(), postEndpoint({
    Config: AnimationConfig,
    file: 'animation.js'
}));
router.put('/api/script', koaBody(), putEndpoint({
    Config: BannerConfig
}));
router.put('/api/badge', koaBody(), putEndpoint({
    Config: BadgeConfig
}));
router.put('/api/animation', koaBody(), putEndpoint({
    Config: AnimationConfig,
}));
router.delete('/api/script', koaBody(), deleteEndpoint({
    Config: BannerConfig
}));
router.delete('/api/badge', koaBody(), deleteEndpoint({
    Config: BadgeConfig
}));
router.delete('/api/animation', koaBody(), deleteEndpoint({
    Config: AnimationConfig,
}));

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
            scopes: ['read_script_tags', 'write_script_tags'],
            async afterAuth(ctx) {
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

    const webhook = receiveWebhook({secret: SHOPIFY_API_SECRET_KEY});

    router.post('webhooks/customers/redact', webhook, (ctx) => {
        console.log('received webhook:', ctx.state.webhook)
    });

    router.post('webhooks/shop/redact', webhook, (ctx) => {
        console.log('received webhook:', ctx.state.webhook)
    });

    router.post('webhooks/customers/data_request', webhook, (ctx) => {
        console.log('received webhook:', ctx.state.webhook)
    });

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

