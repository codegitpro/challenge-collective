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
        this.type = getInputType();
        this.transactionType = getTransactionType();
        this.state = { oldValue: "", edit: false };
    }

    getInputType = () => {
        if (this.props?.notes) {
            return "notes";
        } else if (this.props?.link) {
            return "link";
        } else if (this.props?.boolean) {
            return "select";
        } else if (this.props.placesInput) {
            return "autoComplete";
        } else if (this.props?.dollar) {
            return "number";
        } else {
            return "text";
        }
    };

    getTransactionType = () => {
        return this.props?.notes || this.props?.link
            ? "transactionInfo"
            : this.props.clientInfo
            ? "transitionClientInfo"
            : "transactionInfo";
    };

    getStoreValue = () => {
        const inputName = this.props.name;
        const inputType = this.type;
        const transactionType = this.transactionType;
        const transactionInfo = this.store.transactionInfo;

        if (inputType === "link" || inputType === "notes") {
            return transactionInfo?.[inputName];
        }

        const source = this.store?.[transactionType]?.[inputName];

        if (inputType === "select") {
            if (source === true) {
                return "Yes";
            } else if (source === true) {
                return "No";
            } else {
                return "Select an option";
            }
        }

        return this.props.index ? source[this.props.index - 1] : source;
    };

    setStoreValue = (value: any) => {
        const inputName = this.props.name;
        const transactionType = this.transactionType;

        if (this.props.index) {
            const index = this.props.index - 1;
            this.store[transactionType][inputName][index] = value;
        } else {
            this.store[transactionType][inputName] = value;
        }
    };

    saveTransactionInfo = () => {
        const inputName = this.props.name;
        const addressInputs = [
            "home_address",
            "business_address",
            "home_aptunit",
            "business_aptunit",
        ];

        const isUpdateAddress = addressInputs.includes(inputName);

        if (this.props.clientInfo && isUpdateAddress) {
            this.store.updateClientInfo(inputName);
        } else if (!this.approved) {
            if (inputName === "advised_salary") {
                const tempValue = this.store.transactionInfo[inputName] / 1000;
                const updatedValue = Math.round(tempValue) * 1000;
                this.store.transactionInfo[inputName] = updatedValue;
                this.store.getTransitionPlanPotentialSavings();
            } else {
                const clientId = this.store.transactionClientId;
                this.store.updateTransactionInfo(clientId);
            }
        }
    };

    handlePanelEdit = () => {
        if (!this.approved) {
            const oldValue = this.getStoreValue();
            this.setState({ oldValue, edit: true });
        }
    };

    handlePanelSave = () => {
        const inputType = this.type;
        const isEditMode = this.state.edit === true;

        if (isEditMode && inputType !== "link") {
            this.saveTransactionInfo();
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

    handleInputChange = (e: any) => {
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
        const inputName = this.props.name;

        if (inputName === "business_address") {
            this.store.handleParsedBusinessAddress(address);
            this.store.transitionClientInfo.updateBusinessAddress = true;
            return;
        }
        if (inputName === "home_address") {
            this.store.handleParsedHomeAddress(address);
            this.store.transitionClientInfo.updateHomeAddress = true;
            return;
        }
    };

    render() {
        const inputValue = this.getStoreValue();

        return (
            <Panel
                isEditable={this.props.clientInfo || !this.approved}
                editMode={this.state.edit}
                hasClickOut={this.type !== "notes" && this.type !== "link"}
                onEdit={this.handlePanelEdit}
                onSave={this.handlePanelSave}
                onCancel={this.handlePanelCancel}>
                {this.type === "notes" && (
                    <textarea
                        placeholder="Add a note about this section"
                        value={inputValue}
                        onChange={this.handleInputChange}
                    />
                )}
                {this.type === "link" && <a href={inputValue}>{inputValue}</a>}
                {this.type !== "notes" && this.type !== "link" && (
                    <React.Fragment>
                        {this.state.edit ? (
                            <React.Fragment>
                                {this.type === "select" ? (
                                    <Select
                                        value={inputValue}
                                        options={[
                                            {
                                                key: "select",
                                                value: "Select an option",
                                            },
                                            { key: "yes", value: "Yes" },
                                            { key: "no", value: "No" },
                                        ]}
                                        onChange={this.handleSelect}
                                    />
                                ) : this.type === "autoComplete" ? (
                                    <AutoComplete
                                        value={inputValue}
                                        onChange={this.handleAddressChanged}
                                        onSelect={this.handleAddressSelected}
                                    />
                                ) : (
                                    <input
                                        type={this.type}
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
