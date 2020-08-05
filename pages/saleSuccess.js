import {Button, EmptyState, Heading, Page} from "@shopify/polaris";
import Link from "next/link"
import {useSelector} from "react-redux";

const SaleSuccess = () => {

    const strings = useSelector(state => state.localesReducer.stringsToDisplay.strings.success);

    return (
        <Page>
            <EmptyState
                heading={strings.mainHeading}
                image={'https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg'}
            >
                <Heading>{strings.messageBanner}</Heading>
                <Link href={'/'}><Button primary>{strings.button}</Button></Link>
            </EmptyState>
        </Page>
    )
};

export default SaleSuccess