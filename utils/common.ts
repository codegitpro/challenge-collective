import uuid from "react-native-uuid";

export const CommonUtil = {
    generateKey: (key: string | number = "") => {
        return `${key}_${uuid.v4()}`;
    },
};
