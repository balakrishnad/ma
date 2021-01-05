import * as FileSaver from 'file-saver';
import { Workbook } from 'exceljs';

import {
    getFrequencyString, getColororBnwString, getDateString, getPreferredBrands
} from '../../utils/cardUtils';

export const exportToExcel = (csvData, fileName) => {
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';
    // const headers = headersData;
    // var fields = Object.keys(csvData[0]);
    const headers = ['CUSTOMER NAME', 'VENUE TYPE', 'CMM CONTACT', 'STATUS', 'INVENTORY AVAILABILITY ', 'INVENTORY BLACKOUT DATE(S)', 'TIME FLEXIBILITY', 'TIME FLEXIBILITY NOTES', 'ESTIMATED ANNUAL TRAFFIC', 'COMMITTED FOR NEXT YEAR',
        'COMMITTED FOR NEXT YEAR NOTES', 'REGION', 'LOCATION', 'LOCATION DETAILS', 'FREQUENCY', 'FREQUENCY NOTES', 'SPEC SHEET', 'MEDIA CHANNEL', 'ASSET DESCRIPTION', 'COLOR OR B/W', 'FILE FORMAT',
        'FILE FORMAT DETAILS', 'QUANTITY PER OUTLET', 'SOUND', 'SPEC DIMENSIONS', 'VIDEO ORIENTATION', 'PREFERRED BRAND(S)', 'BRAND RESTRICTIONS', 'KEY DEADLINE(S) FOR CREATIVE', 'ESTIMATED PRODUCTION COSTS', 'CONTRACT EXPIRATION DATE',
        'INVENTORY TRAFFIC PROCESS', 'ADDITIONAL COMMENTS', 'ESTIMATED VALUE', 'CPM', 'MODIFICATION NOTES', 'INVENTORY TYPE', 'ASSET TYPE', 'MARKETING COPY', 'LEGAL DISCLAIMERS', 'CTA', 'CAMPAIGN NAME', 'CAMPAIGN START DATE', 'CAMPAIGN END DATE', 'BRAND(S)', 'CAMPAIGN NOTES', 'CAMPAIGN CONTACT', 'HOLD DATES', 'LOCKED DATES'];

    const fields = ["CustomerName", "VenueType", "CMMContact", "InventoryStatus", "InventoryAvailability", "InventoryBlackedOutDates", "TimeFlexibility", "TimingFlexibilityNotes", "AnnualTraffic", "CommittedForNextYear",
        "CommittedForNextYearNotes", "Region", "LocationDetails", "LocationDetailsText", "Frequency", "FrequencyNotes", "SpecSheetFileName", "MediaChannel", "AssetDescription", "ColorType", "FileFormat",
        "FileFormatDetails", "QuantityPerOutlet", "Sound", "SpecDimensions", "VideoOrientation", "PreferredBrands", "BrandRestrictions", "Deadlines", "EstimatedCostToProduceAndDeliver", "ContractExpirationDate",
        "InventoryTrafficProcess", "AdditionalComments", "InventoryEstimatedValue", "CPM", "ModificationNotes", "InventoryType", "AssetType", "MarketingCopy", "LegalDisclaimers", "CTA", "CampaignName", "CampaignStartDate", "CampaignEndDate", "Brand", "CampaignNotes", "CampaignContact", "InventoryHoldDates", "InventoryLockedDates"];

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
    csvData.forEach((element) => {
        const eachRow = [];
        fields.forEach((field) => {
            switch (field) {
                case 'ColorType':
                    eachRow.push(getColororBnwString(element[field]));
                    break;
                case 'Frequency':
                    eachRow.push(getFrequencyString(element[field]));
                    break;
                case 'InventoryBlackedOutDates':
                case 'InventoryHoldDates':
                case 'InventoryLockedDates':
                    eachRow.push(getDateString(element[field]));
                    break;
                case 'InventoryAvailability':
                    eachRow.push(element['InventoryAvailabilityStartDate'] + ' to ' + element['InventoryAvailabilityEndDate']);
                    break;
                case 'PreferredBrands':
                    eachRow.push(getPreferredBrands(element[field]));
                    break;
                case 'InventoryEstimatedValue':
                case 'CPM':
                case 'EstimatedCostToProduceAndDeliver':
                    eachRow.push(element[field] ? '$ ' + element[field] : '');
                    break;
                case 'SpecSheetFileName':
                    eachRow.push(element['SpecSheetFileName'] || element['SpecSheetURL']);
                    break;
                case 'ModificationNotes':
                    const mNotes = element["AssetDetails"][field].split('[NewNote]').map((note) => {
                        return note.split('[NewLine]').join('\r\n');
                    }).join('\r\n\r\n');

                    eachRow.push(mNotes);
                    break;
                // Campaign Related...
                case 'CampaignName':
                case 'CampaignStartDate':
                case 'CampaignEndDate':
                case 'Brand':
                case 'CampaignNotes':
                case 'CampaignContact':
                    eachRow.push(element["CampaignDetails"][field]);
                    break;
                // Asset Related...
                case 'InventoryType':
                case 'AssetType':
                case 'MarketingCopy':
                case 'LegalDisclaimers':
                case 'CTA':
                    eachRow.push(element["AssetDetails"][field]);
                    break;
                
                default:
                    eachRow.push(element[field]);
                    break;
            }

        });

        worksheet.addRow(eachRow);
    });
    // provide Column width 
    // worksheet.getColumn(2).width = 100;

    worksheet.columns.forEach(col => col.width = 25);
    worksheet.getColumn(36).width = 80;

    worksheet.eachRow({ includeEmpty: false }, (row) => {
        row.eachCell(cell => cell.alignment = { wrapText: true });
    });

    // worksheet.addRow([]);
    //Generate Excel File with given name
    worksheet.properties.outlineLevelCol = 1;

    workbook.xlsx.writeBuffer().then((data) => {
        let blob = new Blob([data], { type: fileType });
        FileSaver.saveAs(blob, fileName + '_export_' + new Date().getTime() + fileExtension);
    });
}
