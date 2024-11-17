import _ from "lodash";

function title(value: string) {
    return _.upperFirst(_.lowerCase(value));
}

export const getFullName = (firstName: string, middleName: string, lastName: string) => {
    if (middleName === "" || middleName === undefined) {
        return `${title(firstName)} ${title(lastName)}`;
    }
    return `${title(firstName)} ${title(middleName)} ${title(lastName)}`;
}