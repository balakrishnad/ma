import * as FileSaver from 'file-saver';
import { Workbook } from 'exceljs';

import {
    getFrequencyString, getColororBnwString, getDateString, getPreferredBrands
} from '../../utils/cardUtils';
import { Switch } from 'react-router';

export const exportToExcel = (csvData, fileName) => {
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';
    // const headers = headersData;
    // var fields = Object.keys(csvData[0]);
    const headers = ['CAMPAIGN NAME', 'CAMPAIGN START DATE', 'CAMPAIGN END DATE', 'BRAND(S)', 'CAMPAIGN NOTES', 'CAMPAIGN CONTACT', 'CUSTOMER NAME', 'INVENTORY AVAILABILITY ', 'STATUS', "CURRENT STATUS", "DATE ASSIGNED", "BRAND MANAGER", "CUSTOMER MARKETING MANAGER", "MEDIA MANAGER", 'HOLD DATES', 'LOCKED DATES', 'AVAILABLE DATES'];

    const fields = ["CampaignName", "CampaignStartDate", "CampaignEndDate", "Brand", "CampaignNotes", "CampaignContact", "CustomerName", "InventoryAvailability", "InventoryStatus", "CurrentStatus", "DateAssigned", "BrandManager", "CustomerMarketingManager", "MediaManager", "InventoryHoldDates", "InventoryLockedDates", "InventoryAvailableDates"];

    //Create workbook and worksheet
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(fileName);
    //Add Header Row
    const headerRow = worksheet.addRow(headers);

    // Cell Style : Fill and Border
    headerRow.eachCell((cell, number) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'darkVertical',
            fgColor: { argb: 'FFFFFF00' },
            bgColor: { argb: 'FFFFFFFF' }
        }
        cell.font = { name: 'Calibri', family: 4, size: 11, bold: true, };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })

    // Add Data and Conditional Formatting
    csvData.forEach((campaign, i) => {
        campaign.Inventory.forEach((element) => {
            const eachRow = [];
            fields.forEach((field) => {
                switch (field) {
                    // Campaign Related...
                    case 'CampaignName':
                        eachRow.push(campaign[field]);
                        break;
                    case 'CampaignStartDate':
                        let startDate = campaign[field].split(' ');
                        let campaignStartDate = startDate[0];
                        eachRow.push(campaignStartDate);
                        break;
                    case 'CampaignEndDate':
                        let endDate = campaign[field].split(' ');
                        let campaignEndDate = endDate[0];
                        eachRow.push(campaignEndDate);
                        break;
                    case 'Brand':
                        eachRow.push(campaign[field]);
                        break;
                    case 'CampaignNotes':
                        eachRow.push(campaign[field]);
                        break;
                    case 'CampaignContact':
                        eachRow.push(campaign[field]);
                        break;
                    case 'InventoryHoldDates':
                        if (element.InventoryStatus === "Hold") {
                            eachRow.push(getDateString(element[field]));
                        } else {
                            eachRow.push('');
                        }
                        break;
                    case 'InventoryLockedDates':
                        if (element.InventoryStatus === "Locked") {
                            eachRow.push(getDateString(element[field]));
                        } else {
                            eachRow.push('');
                        }
                        break;
                    case 'InventoryAvailableDates':
                        if (element.InventoryStatus === "Rejected") {
                            eachRow.push(getDateString(element[field]));
                        } else {
                            eachRow.push('');
                        }
                        break;
                    case 'InventoryAvailability':
                        eachRow.push(element['InventoryAvailabilityStartDate'] + ' to ' + element['InventoryAvailabilityEndDate']);
                        break;
                    case 'BrandManager':
                    case 'CustomerMarketingManager':
                    case 'MediaManager':
                        eachRow.push(element[field].map((obj, i) => {
                            return obj.OwnerDisplayName + '\r\n' + obj.OwnerEmailID;
                        }).join('\r\n\r\n'));
                        break;
                    default:
                        eachRow.push(element[field]);
                        break;
                }
            });
            worksheet.addRow(eachRow);
        })
    });
    // provide Column width 
    worksheet.columns.forEach(col => col.width = 25);
    worksheet.getColumn(4).width = 50;
    worksheet.getColumn(11).width = 60;
    worksheet.getColumn(12).width = 60;
    worksheet.getColumn(13).width = 60;

    worksheet.eachRow({ includeEmpty: false }, (row) => {
        row.eachCell(cell => cell.alignment = { wrapText: true });
    });

    //Generate Excel File with given name
    worksheet.properties.outlineLevelCol = 1;

    workbook.xlsx.writeBuffer().then((data) => {
        let blob = new Blob([data], { type: fileType });
        FileSaver.saveAs(blob, fileName + '_export_' + new Date().getTime() + fileExtension);
    });
}
