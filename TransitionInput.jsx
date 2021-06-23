import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import PlacesAutocomplete, {
    geocodeByAddress,
} from "react-places-autocomplete";
import { Input } from "semantic-ui-react";

import { AutoComplete, Panel, Select } from "./components";

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
@inject("OnboardHykeStore")
@observer
class TransitionInput extends Component {
    constructor(props) {
        super(props);
        this.store = props.OnboardHykeStore;
        this.state = { edit: false, hover: false, oldValue: "" };
    }

    enterEditMode = () => {
        if (!this.store.transactionInfo.approved) {
            this.setState({
                oldValue: this.props.index
                    ? this.store.transactionInfo[this.props.name][
                          this.props.index - 1
                      ]
                    : this.store.transactionInfo[this.props.name],
                edit: true,
            });
        }
    };

    cancelEdit = () => {
        if (this.props.index) {
            this.store.transactionInfo[this.props.name][this.props.index - 1] =
                this.state.oldValue;
        } else {
            this.store.transactionInfo[this.props.name] = this.state.oldValue;
        }
        this.setState({ edit: false });
    };

    saveEdit = removeBtn => {
        if (this.props.clientInfo) {
            if (
                [
                    "home_address",
                    "business_address",
                    "home_aptunit",
                    "business_aptunit",
                ].includes(this.props.name)
            ) {
                this.store.updateClientInfo(this.props.name);
            }
        } else if (!this.store.transactionInfo.approved) {
            if (this.props.name.includes("advised_salary")) {
                this.store.transactionInfo[this.props.name] =
                    Math.round(
                        this.store.transactionInfo[this.props.name] / 1000,
                    ) * 1000;
                this.store.getTransitionPlanPotentialSavings();
            }
            this.store.updateTransactionInfo(this.store.transactionClientId);
        }

        if (removeBtn) {
            this.setState({
                edit: false,
                hover: false,
            });
        } else {
            this.setState({
                edit: false,
            });
        }
    };

    convertToBoolean = e => {
        let value = false;
        if (e.target.value === "Yes") {
            value = true;
        }

        if (e.target.value === "Select an option") {
            value = null;
        }

        this.store.transactionInfo[this.props.name] = value;
    };

    setHoverTrue = () => {
        if (this.props.clientInfo || !this.store.transactionInfo.approved) {
            this.setState({
                hover: true,
            });
        }
    };

    handleInputChange = e => {
        if (!this.store.transactionInfo.approved) {
            if (this.props.index) {
                this.store[
                    this.props.clientInfo
                        ? "transitionClientInfo"
                        : "transactionInfo"
                ][this.props.name][this.props.index - 1] = e.target.value;
            } else {
                this.store[
                    this.props.clientInfo
                        ? "transitionClientInfo"
                        : "transactionInfo"
                ][this.props.name] = e.target.value;
            }
        }
    };

    handleAddressChanged = address => {
        if (!this.store.transactionInfo.approved) {
            if (this.props.index) {
                this.store[
                    this.props.clientInfo
                        ? "transitionClientInfo"
                        : "transactionInfo"
                ][this.props.name][this.props.index - 1] = address;
            } else {
                this.store[
                    this.props.clientInfo
                        ? "transitionClientInfo"
                        : "transactionInfo"
                ][this.props.name] = address;
            }
        }
    };

    handleAddressSelected = address => {
        geocodeByAddress(address)
            .then(results => {
                if (this.props.name === "business_address") {
                    this.store.handleParsedBusinessAddress(results[0]);
                    this.store.transitionClientInfo.updateBusinessAddress = true;
                } else if (this.props.name === "home_address") {
                    this.store.handleParsedHomeAddress(results[0]);
                    this.store.transitionClientInfo.updateHomeAddress = true;
                }
            })
            .catch(error => console.error("Error", error));
    };

    render() {
        const getActionLabel = () => {
            if (this.props.notes) {
                return "save";
            }

            if (!this.props.link) {
                if (!this.state.edit) {
                    return "edit";
                } else {
                    return "save";
                }
            }
        };
        const handlePanelSave = () => {
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

        const transactionValue = this.store.transactionInfo?.[this.props.name];
        const transactionType = this.props.clientInfo
            ? "transitionClientInfo"
            : "transactionInfo";
        const deepValue = this.store?.[transactionType]?.[this.props.name];

        const booleanValue =
            this.props.value ||
            (deepValue && deepValue === true
                ? "Yes"
                : deepValue === false
                ? "No"
                : "Select an option");

        const autoCompleteValue = this.props.index
            ? deepValue[this.props.index - 1]
            : deepValue;

        const selectOptions = [
            {
                key: "select",
                value: "Select an option",
            },
            { key: "yes", value: "Yes" },
            { key: "no", value: "No" },
        ];
        return (
            <Panel>
                {this.props.notes && (
                    <textarea
                        placeholder="Add a note about this section"
                        value={transactionValue}
                        onChange={e => this.handleInputChange(e)}
                    />
                )}
                {this.props.link && (
                    <a href={transactionValue}>{transactionValue}</a>
                )}
                {!this.props.notes && !this.props.link && (
                    <React.Fragment>
                        {this.state.edit && (
                            <React.Fragment>
                                {this.props.boolean ? (
                                    <Select
                                        value={booleanValue}
                                        options={selectOptions}
                                        onChange={this.convertToBoolean}
                                    />
                                ) : this.props.placesInput ? (
                                    <AutoComplete
                                        value={autoCompleteValue}
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
                                        value={autoCompleteValue}
                                        onChange={this.handleInputChange}
                                    />
                                )}
                            </React.Fragment>
                        )}

                        {!this.state.edit && (
                            <span onClick={this.enterEditMode}>
                                {this.props.boolean
                                    ? booleanValue
                                    : autoCompleteValue}
                            </span>
                        )}
                    </React.Fragment>
                )}
            </Panel>
        );
    }
}

export default TransitionInput;
