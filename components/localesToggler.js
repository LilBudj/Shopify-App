import {ActionList, Button, Icon, Popover} from "@shopify/polaris";
import {useCallback, useState} from "react";
import {SettingsMajorMonotone} from "@shopify/polaris-icons";
import {setLocales} from "../redux/localesReducer";
import {connect} from "react-redux";

const LocalesToggler = (props) => {

    const [localePopoverActive, setLocalePopoverActive] = useState(false);

    const toggleLocalePopoverActive = useCallback(
        () => setLocalePopoverActive((popoverActive) => !popoverActive),
        [],
    );

    const activator = (
        <Button
            plain
            onClick={toggleLocalePopoverActive}
        >
            <Icon source={SettingsMajorMonotone}/>
        </Button>
    );

    return(
        <div style={{marginTop: '20px'}}>
            <Popover
                active={localePopoverActive}
                activator={activator}
                onClose={toggleLocalePopoverActive}
            >
                <ActionList items={[
                    {content: 'English', onAction: () => props.setLocales('en')},
                    {content: 'Russian', onAction: () => props.setLocales('ru')},
                    {content: 'German', onAction: () => props.setLocales('de')}
                    ]} />
            </Popover>
        </div>
    )
};

export default connect(null, {setLocales})(LocalesToggler)