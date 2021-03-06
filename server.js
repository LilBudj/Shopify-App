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
// mongoose client access to DB

const next = require('next');

const {default: createShopifyAuth} = require('@shopify/koa-shopify-auth');
const {verifyRequest} = require('@shopify/koa-shopify-auth');
const session = require('koa-session');
const axios = require('axios');
const DBAccess = require('./server_modules/dbAccess');
const rep = require('./server_modules/repository');
const end = require('./server_modules/endpoints');
const getSubscriptionUrl = require('./server_modules/subscription');
const uninstallWebhook = require('./server_modules/uninstallWebhook');

dotenv.config();

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
// DB connection

const port = process.env.PORT || 8000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({dev});
const handle = app.getRequestHandler();
//app deployment

const {default: graphQLProxy} = require('@shopify/koa-shopify-graphql-proxy');
const {ApiVersion} = require('@shopify/koa-shopify-graphql-proxy');
const {receiveWebhook, registerWebhook} = require('@shopify/koa-shopify-webhooks');
const {SHOPIFY_API_SECRET_KEY, SHOPIFY_API_KEY, HOST} = process.env;
//Shopify connections

const server = new Koa();
const router = new KoaRouter();

let {BannerConfig, BadgeConfig, AnimationConfig} = DBAccess;
const {getEndpoint, postEndpoint, putEndpoint, deleteEndpoint,
    billingCheck, amplitudeEvent, amplitudeUninstallEvent} = end;
//server modules

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
//// server routing

router.get('/amplitude/intro', amplitudeEvent({
    event_type: 'intro_screen',
}));
router.get('/amplitude/main', amplitudeEvent({
    event_type: 'main_screen',
}));
router.get('/amplitude/countdown/in', amplitudeEvent({
    event_type: 'countdown_timer_page',
}));
router.get('/amplitude/banner/in', amplitudeEvent({
    event_type: 'countdown_banner_page',
}));
router.get('/amplitude/popup/in', amplitudeEvent({
    event_type: 'countdown_popup_page',
}));
router.get('/amplitude/countdown/created', amplitudeEvent({
    event_type: 'countdown_timer_created',
}));
router.get('/amplitude/banner/created', amplitudeEvent({
    event_type: 'sale_banner_created',
}));
router.get('/amplitude/popup/created', amplitudeEvent({
    event_type: 'popup_animation_created',
}));
// amplitude endpoints

server.use(router.allowedMethods());
server.use(router.routes());
server.use(cors());
// server route tools

router.get('/billing/check', billingCheck);  // endpoint for billing check

app.prepare().then(() => {

    server.use(session({secure: true, sameSite: 'none'}, server));
    server.keys = [SHOPIFY_API_SECRET_KEY];
    server.use(
        createShopifyAuth(rep.authOptions)
    );
    // shopify app connection/registration

    const webhook = receiveWebhook({secret: SHOPIFY_API_SECRET_KEY});

    router.post('webhooks/customers/redact', webhook, (ctx) => {
        console.log('received webhook:', ctx.state.webhook);
    });

    router.post('webhooks/shop/redact', webhook, (ctx) => {
        console.log('received webhook:', ctx.state.webhook);
    });

    router.post('webhooks/customers/data_request', webhook, (ctx) => {
        console.log('received webhook:', ctx.state.webhook);
    });

    router.post('/webhooks/app/uninstalled', webhook, uninstallWebhook);
    //idling webhooks

    server.use(graphQLProxy({version: ApiVersion.January20}));
    server.use(verifyRequest());
    server.use(async (ctx) => {
       await handle(ctx.req, ctx.res);
       ctx.respond = false;
       ctx.res.statusCode = 200;
    });
    // shopify API connection

    server.listen(port, () => {
        console.log(`App is ready on port ${port}`)
    });
    //server deployment
});

