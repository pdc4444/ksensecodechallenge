export type tableProps = {
    // An array of strings to be used as the header
    headers: Array<string | headerObject>
    // An array of arrays of any that will be used as the data rows
    // Note: the array length of the dataRows need to match the array length of the headers
    data: Array<Array<string | Element>>
    // The element Id of the table that will be rendered. You can set this to whatever you want
    tableId: string
    // The number of rows to render in the table per page. This should be tuned to your needs. Defaults to 40
    rowsPerPage?: number
    // actionBarElement expects a function that returns an HTML object which will be drawn into the action bar at the bottom of the table
    // This is useful if you'd like to add a custom button or action to the table
    actionBarElement?: Function
}

// An optional type to give the user more fine control over the headers
export type headerObject = {
    label: string,
    sortable: boolean
}