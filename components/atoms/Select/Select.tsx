import React from "react";

import "./Select.scss";

export interface SelectProps {
    value: string | number;
    options: Array<{ key: string; value: string | number }>;
    onChange: () => void;
}

export const Select = (props: SelectProps) => (
    <select value={props.value} onChange={props.onChange}>
        {props?.options.map(item => (
            <option value={item.key}>{item.value}</option>
        ))}
    </select>
);
