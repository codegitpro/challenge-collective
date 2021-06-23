import React, { Component, Fragment } from 'react';
import { observer, inject } from 'mobx-react';
import ClickOutHandler from 'react-onclickout';
import PlacesAutocomplete, { geocodeByAddress } from 'react-places-autocomplete';
import { Input } from 'semantic-ui-react';

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
@inject('OnboardHykeStore')
@observer
class TransitionInput extends Component {
    constructor(props) {
        super(props);
        this.store = props.OnboardHykeStore;
        this.state = { edit: false, hover: false, oldValue: '' };
    }

    enterEditMode = () => {
        if (!this.store.transactionInfo.approved) {
            this.setState({
                oldValue: this.props.index
                    ? this.store.transactionInfo[this.props.name][this.props.index - 1]
                    : this.store.transactionInfo[this.props.name],
                edit: true
            });
        }
    };

    cancelEdit = () => {
        if (this.props.index) {
            this.store.transactionInfo[this.props.name][this.props.index - 1] = this.state.oldValue;
        } else {
            this.store.transactionInfo[this.props.name] = this.state.oldValue;
        }
        this.setState({ edit: false });
    };

    saveEdit = removeBtn => {
        if (this.props.clientInfo) {
            if (['home_address', 'business_address', 'home_aptunit', 'business_aptunit'].includes(this.props.name)) {
                this.store.updateClientInfo(this.props.name);
            }
        } else if (!this.store.transactionInfo.approved) {
            if (this.props.name.includes('advised_salary')) {
                this.store.transactionInfo[this.props.name] =
                    Math.round(this.store.transactionInfo[this.props.name] / 1000) * 1000;
                this.store.getTransitionPlanPotentialSavings();
            }
            this.store.updateTransactionInfo(this.store.transactionClientId);
        }

        if (removeBtn) {
            this.setState({
                edit: false,
                hover: false
            });
        } else {
            this.setState({
                edit: false
            });
        }
    };

    convertToBoolean = e => {
        let value = false;
        if (e.target.value === 'Yes') {
            value = true;
        }

        if (e.target.value === 'Select an option') {
            value = null;
        }

        this.store.transactionInfo[this.props.name] = value;
    };

    setHoverTrue = () => {
        if (this.props.clientInfo || !this.store.transactionInfo.approved) {
            this.setState({
                hover: true
            });
        }
    };

    handleInputChange = e => {
        if (!this.store.transactionInfo.approved) {
            if (this.props.index) {
                this.store[this.props.clientInfo ? 'transitionClientInfo' : 'transactionInfo'][this.props.name][
                    this.props.index - 1
                ] = e.target.value;
            } else {
                this.store[this.props.clientInfo ? 'transitionClientInfo' : 'transactionInfo'][this.props.name] =
                    e.target.value;
            }
        }
    };

    handleAddressChanged = address => {
        if (!this.store.transactionInfo.approved) {
            if (this.props.index) {
                this.store[this.props.clientInfo ? 'transitionClientInfo' : 'transactionInfo'][this.props.name][
                    this.props.index - 1
                ] = address;
            } else {
                this.store[this.props.clientInfo ? 'transitionClientInfo' : 'transactionInfo'][
                    this.props.name
                ] = address;
            }
        }
    };

    handleAddressSelected = address => {
        geocodeByAddress(address)
            .then(results => {
                if (this.props.name === 'business_address') {
                    this.store.handleParsedBusinessAddress(results[0]);
                    this.store.transitionClientInfo.updateBusinessAddress = true;
                } else if (this.props.name === 'home_address') {
                    this.store.handleParsedHomeAddress(results[0]);
                    this.store.transitionClientInfo.updateHomeAddress = true;
                }
            })
            .catch(error => console.error('Error', error));
    };

    render() {
        return (
            <Fragment>
                {this.props.notes ? (
                    <Fragment>
                        <div
                            onMouseEnter={this.setHoverTrue}
                            onMouseLeave={() => this.setState({ hover: false })}
                            className="transition-input transition-note">
                            <textarea
                                placeholder="Add a note about this section"
                                value={this.store.transactionInfo[this.props.name]}
                                onChange={e => this.handleInputChange(e)}
                            />

                            {this.state.hover && (
                                <div onClick={() => this.saveEdit(true)} className="transition-edit">
                                    Save
                                </div>
                            )}
                        </div>
                    </Fragment>
                ) : this.props.link ? (
                    <Fragment>
                        <div
                            onMouseEnter={this.setHoverTrue}
                            onMouseLeave={() => this.setState({ hover: false })}
                            className="transition-input transition-note">
                            <a href={this.store.transactionInfo[this.props.name]}>
                                {this.store.transactionInfo[this.props.name]}
                            </a>
                        </div>
                    </Fragment>
                ) : (
                    <Fragment>
                        <div
                            className="transition-input"
                            onMouseEnter={this.setHoverTrue}
                            onMouseLeave={() => this.setState({ hover: false })}>
                            {this.state.edit && (
                                <ClickOutHandler onClickOut={this.cancelEdit}>
                                    {this.props.boolean ? (
                                        <select
                                            onChange={e => this.convertToBoolean(e)}
                                            value={
                                                this.props.value ||
                                                (this.store[
                                                    this.props.clientInfo ? 'transitionClientInfo' : 'transactionInfo'
                                                ][this.props.name] &&
                                                this.store[
                                                    this.props.clientInfo ? 'transitionClientInfo' : 'transactionInfo'
                                                ][this.props.name] === true
                                                    ? 'Yes'
                                                    : this.store[
                                                          this.props.clientInfo
                                                              ? 'transitionClientInfo'
                                                              : 'transactionInfo'
                                                      ][this.props.name] === false
                                                    ? 'No'
                                                    : 'Select an option')
                                            }>
                                            <option>Select an option</option>
                                            <option>Yes</option>
                                            <option>No</option>
                                        </select>
                                    ) : this.props.placesInput ? (
                                        <PlacesAutocomplete
                                            value={
                                                this.props.index
                                                    ? this.store[
                                                          this.props.clientInfo
                                                              ? 'transitionClientInfo'
                                                              : 'transactionInfo'
                                                      ][this.props.name][this.props.index - 1]
                                                    : this.store[
                                                          this.props.clientInfo
                                                              ? 'transitionClientInfo'
                                                              : 'transactionInfo'
                                                      ][this.props.name]
                                            }
                                            onChange={this.handleAddressChanged}
                                            onSelect={this.handleAddressSelected}>
                                            {({ getInputProps, suggestions, getSuggestionItemProps }) => (
                                                <div className="hyke-autocomplete">
                                                    <Input
                                                        {...getInputProps({
                                                            placeholder: '',
                                                            className: 'location-search-input'
                                                        })}
                                                    />
                                                    <ul className="hyke-autocomplete__list">
                                                        {suggestions.map((suggestion, key) => {
                                                            const className = suggestion.active ? 'is-active' : null;
                                                            return (
                                                                <li
                                                                    key={key}
                                                                    {...getSuggestionItemProps(suggestion, {
                                                                        className
                                                                    })}>
                                                                    <span>{suggestion.description}</span>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                </div>
                                            )}
                                        </PlacesAutocomplete>
                                    ) : (
                                        <input
                                            type={this.props.dollar ? 'number' : 'text'}
                                            placeholder={this.props.placeholder}
                                            value={
                                                this.props.index
                                                    ? this.store[
                                                          this.props.clientInfo
                                                              ? 'transitionClientInfo'
                                                              : 'transactionInfo'
                                                      ][this.props.name][this.props.index - 1]
                                                    : this.store[
                                                          this.props.clientInfo
                                                              ? 'transitionClientInfo'
                                                              : 'transactionInfo'
                                                      ][this.props.name]
                                            }
                                            onChange={e => this.handleInputChange(e)}
                                        />
                                    )}

                                    {this.state.edit && (
                                        <div onClick={this.saveEdit} className="transition-edit">
                                            Save
                                        </div>
                                    )}
                                </ClickOutHandler>
                            )}

                            {!this.state.edit && (
                                <Fragment>
                                    <span onClick={this.enterEditMode}>
                                        {this.props.boolean
                                            ? this.props.value ||
                                              (this.store[
                                                  this.props.clientInfo ? 'transitionClientInfo' : 'transactionInfo'
                                              ][this.props.name] &&
                                              this.store[
                                                  this.props.clientInfo ? 'transitionClientInfo' : 'transactionInfo'
                                              ][this.props.name] === true
                                                  ? 'Yes'
                                                  : this.store[
                                                        this.props.clientInfo
                                                            ? 'transitionClientInfo'
                                                            : 'transactionInfo'
                                                    ][this.props.name] === false
                                                  ? 'No'
                                                  : 'Select an option')
                                            : this.props.index
                                            ? this.store[
                                                  this.props.clientInfo ? 'transitionClientInfo' : 'transactionInfo'
                                              ][this.props.name][this.props.index - 1]
                                            : `${this.props.dollar ? '$' : ''}${
                                                  this.store[
                                                      this.props.clientInfo ? 'transitionClientInfo' : 'transactionInfo'
                                                  ][this.props.name]
                                              }`}
                                    </span>

                                    {this.state.hover && (
                                        <div onClick={this.enterEditMode} className="transition-edit">
                                            Edit
                                        </div>
                                    )}
                                </Fragment>
                            )}
                        </div>
                    </Fragment>
                )}
            </Fragment>
        );
    }
}

export default TransitionInput;
