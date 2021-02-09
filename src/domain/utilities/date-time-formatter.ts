export class DateTimeFormatter {

    static formatDateTime(date: Date): string {

        let formattedDate: string = '';
        formattedDate += date.getFullYear() >= 10 ? date.getFullYear() : `0${date.getFullYear()}`;
        formattedDate += '-';
        formattedDate += (date.getMonth() + 1) >= 10 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`;
        formattedDate += '-';
        formattedDate += date.getDate() >= 10 ? date.getDate() : `0${date.getDate()}`;
        formattedDate += ' ';
        formattedDate += date.getHours() >= 10 ? date.getHours() : `0${date.getHours()}`;
        formattedDate += ':';
        formattedDate += date.getMinutes() >= 10 ? date.getMinutes() : `0${date.getMinutes()}`;
        formattedDate += ':';
        formattedDate += date.getSeconds() >= 10 ? date.getSeconds() : `0${date.getSeconds()}`;

        return formattedDate;
    }
}