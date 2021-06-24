// @ts-nocheck
import React, { Component } from "react";
import { observer, inject } from "mobx-react";

import { AutoComplete, Panel, Select } from "../components";
import { TextUtil } from "../utils";

/**
 * @example
 *   <TransitionInput name="separate_business_bank_account" boolean />
 *   <TransitionInput name="employee_multiple_states" />
 *   <TransitionInput name="banking_notes" notes />
 *   <TransitionInput clientInfo name="home_state" />
 *   <TransitionInput clientInfo name="home_address" placesInput />
 *   <TransitionInput name="permanent_file" link />
 *   <TransitionInput name="expected_expenses" dollar />
 *   {this.store.transactionInfo.children_dob_list.map((child, index) => (
 *     <div key={child}>
 *       <TransitionInput name="children_fullname_list" index={index + 1} />
 *       <TransitionInput name="children_dob_list" index={index + 1} />
 *     </div>
 *   ))}
 */

interface Store {
    transactionInfo: {
        [key: string]: Array<any> | any;
    };
    transitionClientInfo: {};
}

interface TransitionInputProps {
    name: string;
    index: number;
    value: any;
    notes?: boolean;
    link?: boolean;
    boolean?: boolean;
    clientInfo?: boolean;
    placesInput?: boolean;
    dollar?: boolean;
    type?: string;
    OnboardHykeStore: Store;
}

interface TransitionInputState {
    edit: boolean;
    hover: boolean;
    oldValue: string;
}

@inject("OnboardHykeStore")
@observer
export class TransitionInput extends Component<
    TransitionInputProps,
    TransitionInputState
> {
    store: Store;
    state: TransitionInputState;
    props: TransitionInputProps;

    constructor(props: TransitionInputProps) {
        super(props);
        this.store = props.OnboardHykeStore as Store;
        this.approved = this.store.transactionInfo.approved;
        this.state = { edit: false, oldValue: "" };
    }

    getStoreValue = () => {
        const transactionInfo = this.store.transactionInfo;

        if (this.props?.notes || this.props?.link) {
            return transactionInfo?.[this.props.name];
        }

        const transactionType = this.props.clientInfo
            ? "transitionClientInfo"
            : "transactionInfo";

        const source = this.store?.[transactionType]?.[this.props.name];

        if (this.props?.boolean) {
            return (
                this.props.value ||
                (source === true
                    ? "Yes"
                    : source === false
                    ? "No"
                    : "Select an option")
            );
        }

        return this.props.index ? source[this.props.index - 1] : source;
    };

    setStoreValue = value => {
        const transactionType =
            this.props?.notes || this.props?.link
                ? "transactionInfo"
                : this.props.clientInfo
                ? "transitionClientInfo"
                : "transactionInfo";

        if (this.props.index) {
            this.store[transactionType][this.props.name][this.props.index - 1] =
                value;
        } else {
            this.store[transactionType][this.props.name] = value;
        }
    };

    handlePanelEdit = () => {
        if (!this.approved) {
            const oldValue = this.getStoreValue();
            this.setState({ oldValue, edit: true });
        }
    };

    handlePanelSave = () => {
        const clientInfoInputs = [
            "home_address",
            "business_address",
            "home_aptunit",
            "business_aptunit",
        ];

        const isUpdateClient = clientInfoInputs.includes(this.props.name);

        if (this.props.clientInfo && isUpdateClient) {
            this.store.updateClientInfo(this.props.name);
        } else if (!this.approved) {
            if (this.props.name === "advised_salary") {
                const updatedValue =
                    Math.round(
                        this.store.transactionInfo[this.props.name] / 1000,
                    ) * 1000;
                this.store.transactionInfo[this.props.name] = updatedValue;
                this.store.getTransitionPlanPotentialSavings();
            } else {
                this.store.updateTransactionInfo(
                    this.store.transactionClientId,
                );
            }
        }

        this.setState({ edit: false });
    };

    handlePanelCancel = () => {
        this.setStoreValue(this.state.oldValue);
        this.setState({ edit: false });
    };

    handleSelect = (e: any) => {
        const newValue = TextUtil.convertToBoolean(e.target.value);
        this.setStoreValue(newValue);
    };

    handleInputChange = e => {
        if (!this.approved) {
            setStoreValue(e.target.value);
        }
    };

    handleAddressChanged = address => {
        if (!this.approved) {
            setStoreValue(address);
        }
    };

    handleAddressSelected = address => {
        if (this.props.name === "business_address") {
            this.store.handleParsedBusinessAddress(address);
            this.store.transitionClientInfo.updateBusinessAddress = true;
            return;
        }
        if (this.props.name === "home_address") {
            this.store.handleParsedHomeAddress(address);
            this.store.transitionClientInfo.updateHomeAddress = true;
            return;
        }
    };

    handlePanelSave = () => {
        if (this.props.notes) {
            this.saveEdit(true);
            return;
        }
        if (!this.props.link) {
            if (this.state.edit === true) {
                this.saveEdit();
            } else if (!this.props?.link) {
                this.enterEditMode;
            }
        }
    };

    render() {
        const selectOptions = [
            {
                key: "select",
                value: "Select an option",
            },
            { key: "yes", value: "Yes" },
            { key: "no", value: "No" },
        ];
        const inputValue = this.getStoreValue();
        const actionLabel =
            this.props.notes || (!this.props.link && this.state.edit)
                ? "save"
                : !this.props.link && !this.state.edit
                ? "edit"
                : undefined;

        return (
            <Panel
                actionLabel={actionLabel}
                isEditable={this.props.clientInfo || !this.approved}
                hasClickHandler={!this.props?.notes && !this.props.link}
                onSave={this.handlePanelSave}
                onClickOut={this.handlePanelCancel}>
                {this.props.notes && (
                    <textarea
                        placeholder="Add a note about this section"
                        value={inputValue}
                        onChange={this.handleInputChange}
                    />
                )}
                {this.props.link && <a href={inputValue}>{inputValue}</a>}
                {!this.props.notes && !this.props.link && (
                    <React.Fragment>
                        {this.state.edit ? (
                            <React.Fragment>
                                {this.props.boolean ? (
                                    <Select
                                        value={inputValue}
                                        options={selectOptions}
                                        onChange={this.handleSelect}
                                    />
                                ) : this.props.placesInput ? (
                                    <AutoComplete
                                        value={inputValue}
                                        onChange={this.handleAddressChanged}
                                        onSelect={this.handleAddressSelected}
                                    />
                                ) : (
                                    <input
                                        type={
                                            this.props.dollar
                                                ? "number"
                                                : "text"
                                        }
                                        placeholder={this.props.placeholder}
                                        value={inputValue}
                                        onChange={this.handleInputChange}
                                    />
                                )}
                            </React.Fragment>
                        ) : (
                            <span onClick={this.handlePanelEdit}>
                                {inputValue}
                            </span>
                        )}
                    </React.Fragment>
                )}
            </Panel>
        );
    }
}
