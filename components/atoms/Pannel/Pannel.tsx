import React from "react";
import cx from "classnames";

import "./Panel.scss";

export interface PanelProps {
    className?: string;
    isEdit?: boolean;
    onSave: () => void;
    children: React.ReactNode;
}

export const Panel = (props: PanelProps) => {
    const [isActive, setActive] = React.useState<boolean>(
        props.isEdit || false,
    );

    const toggleActive = React.useCallback(() => {
        setActive(!isActive);
    }, [isActive]);

    return (
        <div
            className={cx("transition-input transition-note", props?.className)}
            onMouseEnter={toggleActive}
            onMouseLeave={toggleActive}>
            {props?.children}
            {isActive && (
                <div className="transition-edit" onClick={props.onSave}>
                    Save
                </div>
            )}
        </div>
    );
};
