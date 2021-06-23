export const TextUtil = {
    convertToBoolean: (val: string) =>
        val === "Yes" ? true : val === "Select an option" ? null : false,
};
