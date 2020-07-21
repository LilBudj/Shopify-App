import {DisplayText, Heading, Layout, Page} from "@shopify/polaris";
import Link from "next/link";
import Button from "@material-ui/core/Button";
import {withStyles} from "@material-ui/core";

const ShopifyButton = withStyles({
    root: {
        padding: '8px 16px',
        textTransform: 'none',
        fontSize: 18,
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(','),
    }
})(Button);

const InitPage = (props) => {
    return(
        <Page>
            <Layout>
                <div style={{display: "flex", justifyContent: "space-evenly", alignItems: "center", width: '100%', height: '100%'}}>
                    <div style={{display: "flex", flexDirection: "column", width: "50%", height: "420px", justifyContent: "space-evenly"}}>
                        <DisplayText size={'extraLarge'}>
                            TopSale Countdown Banner
                        </DisplayText>
                        <DisplayText size="small">
                            Increase sales with urgency, countdown timer, labels and awesome banners
                        </DisplayText>
                        <div style={{width: '200px'}}>
                            <Link href={'/bannerVariants'}>
                        <ShopifyButton
                            variant="contained"
                            color="primary"
                            size={'large'}
                            onClick={() => {
                                //props.setInitBar(true)
                            }}
                        >
                            Create Banner
                        </ShopifyButton>
                            </Link>
                        </div>
                    </div>
                    <img src={'https://lil-proxy.herokuapp.com/static/sale.gif'} alt={'sale'}/>
                </div>
            </Layout>
        </Page>
    )
};

export default InitPage