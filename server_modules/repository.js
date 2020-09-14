const DBAccess = require('./dbAccess');
const getSubscriptionUrl = require('./subscription');
const {registerWebhook} = require('@shopify/koa-shopify-webhooks');
const {ApiVersion} = require('@shopify/koa-shopify-graphql-proxy');
const BannerConfig = DBAccess.BannerConfig;
const BadgeConfig = DBAccess.BadgeConfig;

const modelDecoder = (ctx, Config) => {
    return new Promise((res, rej) => {
        const config = Config.find({shop: ctx.cookies.get('shopOrigin')});
        config.exec((err, conf) => {
            if (err) {rej(err)}
            else res(conf)
        })
    })
}; // special function for erasing data from mongoose config model

const getter = () => {
    return new Promise((res, rej) => {
        const arr = BannerConfig.find();
        arr.exec((err, conf) => {
            if (err) {rej(err)}
            else res(conf)
        })
    })
}; // special testing function

class AmplitudeFabricator {
    constructor(bundle) {
        this.event_type = bundle.event;
        this.user_id = bundle.userId;
        this.ip = bundle.ip
    }

    event_type = '';
    user_id = 'null_id';
    ip = '127.0.0.1'
}

const authOptions = {
    apiKey: process.env.SHOPIFY_API_KEY,
    secret: process.env.SHOPIFY_API_SECRET_KEY,
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

        const registration = await registerWebhook({
            address: `${process.env.HOST}webhooks/app/uninstalled`,
            topic: 'APP_UNINSTALLED',
            accessToken,
            shop,
            apiVersion: ApiVersion.January20
        });

        if (registration.success) {
            console.log('Successfully registered uninstall-webhook!');
        } else {
            console.log('Failed to register webhook', registration.result);
        }

        //await getSubscriptionUrl(ctx, accessToken, shop);
        ctx.redirect('/');
    }
};

module.exports = {
    decoder: modelDecoder,
    getter,
    AmplitudeFabricator,
    authOptions
};
