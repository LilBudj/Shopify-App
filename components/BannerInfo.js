import {Button, Card, Icon} from "@shopify/polaris";
import Link from "next/link";
import {connect} from "react-redux";

const BannerInfo = (props) => {
    return(
        <Card sectioned>
            <div style={{
            display: "flex",
            justifyContent: "space-between",
            padding: '10px',
            borderBottom: "1px solid grey"
        }}>
            <p>{props.strings.bannerName}</p>
        </div>
            <div style={{width: "100%", display: "flex", justifyContent: "space-between", padding: '10px'}}>
                <b style={{fontSize: "24px"}}>{props.data.script[0].configData ? props.data.script[0].configData.name : "Banner"}</b>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <Link href={props.link}>
                    <Button
                        primary
                    >
                        {props.strings.goToConfig}
                    </Button>
                    </Link>
                </div>
            </div>
            </Card>
    )
};

const mapStateToProps = (state) => ({
    strings: state.localesReducer.stringsToDisplay.strings.bannerInfo
});

export default connect(mapStateToProps)(BannerInfo)