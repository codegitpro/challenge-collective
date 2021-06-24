import React from "react";
import ClickOutHandler from "react-onclickout";
import cx from "classnames";

import "./Panel.scss";

export interface PanelProps {
    className?: string;
    editMode?: boolean;
    isEditable?: boolean;
    hasClickOut?: boolean;
    onEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
    children: React.ReactNode;
}

export const Panel = React.memo((props: PanelProps) => {
    const [isActive, setActive] = React.useState<boolean>(false);

    const toggleActive = React.useCallback(() => {
        if (props?.isEditable) {
            setActive(!isActive);
        }
    }, [props?.isEditable, isActive]);

    const renderContent = (
        <React.Fragment>
            {props?.children}
            {isActive && props?.editMode && (
                <div className="transition-edit" onClick={props.onSave}>
                    Save
                </div>
            )}
            {isActive && !props?.editMode && (
                <div className="transition-edit" onClick={props.onEdit}>
                    Edit
                </div>
            )}
        </React.Fragment>
    );

    return (
        <div
            className={cx("transition-input transition-note", props?.className)}
            onMouseEnter={toggleActive}
            onMouseLeave={toggleActive}>
            {props?.hasClickOut ? (
                <ClickOutHandler onClickOut={props.onCancel}>
                    {renderContent}
                </ClickOutHandler>
            ) : (
                renderContent
            )}
        </div>
    );
});
