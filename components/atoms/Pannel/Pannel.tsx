import React from "react";
import ClickOutHandler from "react-onclickout";
import cx from "classnames";

import "./Panel.scss";

export interface PanelProps {
    className?: string;
    isEdit?: boolean;
    actionLabel?: string;
    hasClickHandler?: boolean;
    onSave: () => void;
    onClickOut?: () => void;
    children: React.ReactNode;
}

export const Panel = (props: PanelProps) => {
    const [isActive, setActive] = React.useState<boolean>(
        props.isEdit || false,
    );

    const toggleActive = React.useCallback(() => {
        setActive(!isActive);
    }, [isActive]);

    const renderContent = (
        <React.Fragment>
            {props?.children}
            {props.actionLabel && isActive && (
                <div className="transition-edit" onClick={props.onSave}>
                    {props.actionLabel}
                </div>
            )}
        </React.Fragment>
    );

    return (
        <div
            className={cx("transition-input transition-note", props?.className)}
            onMouseEnter={toggleActive}
            onMouseLeave={toggleActive}>
            {props?.hasClickHandler ? (
                <ClickOutHandler>{renderContent}</ClickOutHandler>
            ) : (
                renderContent
            )}
        </div>
    );
};
