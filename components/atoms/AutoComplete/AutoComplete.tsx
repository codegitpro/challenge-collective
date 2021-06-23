import React from "react";
import PlacesAutocomplete, {
    geocodeByAddress,
} from "react-places-autocomplete";
import { Input } from "semantic-ui-react";

import { CommonUtil } from "../../../utils";

import "./AutoComplete.scss";

interface SearchInputProps {
    getInputProps: (data: any) => any;
}

const SearchInput = (props: SearchInputProps) => {
    const inputProps = props?.getInputProps({
        placeholder: "",
        className: "location-search-input",
    });
    return <Input {...inputProps} />;
};

interface Suggestion {
    [key: string]: any;
}

interface SuggestionListProps {
    suggestions: Array<Suggestion>;
    serialize: (suggestion: Suggestion, options: any) => any;
}

const SuggestionList = (props: SuggestionListProps) => {
    return (
        <ul className="hyke-autocomplete__list">
            {props?.suggestions.map(item => {
                const itemProps = props.serialize(item, {
                    className: item.active ? "is-active" : null,
                });
                return (
                    <li
                        key={CommonUtil.generateKey(item.description)}
                        {...itemProps}>
                        <span>{item.description}</span>
                    </li>
                );
            })}
        </ul>
    );
};

export interface AutoCompleteProps {
    value: string;
    onChange: (result: string) => void;
    onSelect: (result: string) => void;
}

export const AutoComplete = (props: AutoCompleteProps) => {
    const handleAddressSelected = React.useCallback(
        (address: string) => {
            geocodeByAddress(address)
                .then(results => {
                    props.onSelect(results?.[0]);
                })
                .catch(error => console.error("Error", error));
        },
        [props],
    );

    return (
        <PlacesAutocomplete
            value={props.value}
            onChange={props.onChange}
            onSelect={handleAddressSelected}>
            {({ getInputProps, suggestions, getSuggestionItemProps }) => (
                <div className="hyke-autocomplete">
                    <SearchInput getInputProps={getInputProps} />
                    <SuggestionList
                        suggestions={suggestions}
                        serialize={getSuggestionItemProps}
                    />
                </div>
            )}
        </PlacesAutocomplete>
    );
};
