import React, { useState, useEffect } from 'react';
import { Pagination } from 'react-bootstrap';
import './Pagination.css';

export default ({ itemsCount, onPageChange, cardCount, fromToCount, data, showSamePage, activePageItem }) => {
    const [activePage, setActivePage] = useState(1); // active page item
    const [startPage, setStartPage] = useState(1);
    const totalPages = Math.ceil(itemsCount / cardCount); // total no of pages
    const [pageNum, setPageNum] = useState([]);

    const handleSelect = (e) => { // when page item is selected
        const currentPage = parseInt(e.target.innerText);
        const firstPage = getFirstPage(startPage, currentPage);
        setActivePage(currentPage);
        setStartPage(firstPage);
        onPageChange(currentPage, cardCount);
    };

    const getFirstPage = (firstPage, currentPage) => { // to get the first page of the page item
        if (currentPage + 2 <= totalPages) {
            firstPage = currentPage - 2;
        } else if (currentPage + 1 <= totalPages) {
            firstPage = currentPage - 1;
        } else if (currentPage - 2 >= 0) {
            firstPage = currentPage - 2;
        } else if (currentPage - 1 >= 0) {
            firstPage = currentPage - 1;
        }
        firstPage = firstPage <= 0 ? 1 : firstPage; // if firstpage is less than 0, reset 1 as first page
        return firstPage;
    };

    useEffect(() => {
        const pageArray = [];
        for (let i = startPage; i <= startPage + 4; i++) {
            if (i <= totalPages) {
                pageArray.push(i);
            } else {
                break;
            }
        }
        setPageNum(pageArray);
    }, [startPage, data]);

    useEffect(() => {
        if (!showSamePage) {
            setActivePage(1); // whenever there is a change in data due to filter, need to update
            setStartPage(1);
        } else {
            setActivePage(activePageItem);
            const firstPage = getFirstPage(activePageItem - (activePageItem % 5));
            setStartPage(firstPage);
        }
    }, [data, showSamePage])

    const gotoFirstPage = () => { // set both current page and starting page as 1
        setActivePage(1);
        setStartPage(1);
        onPageChange(1, cardCount);
    };

    const gotoPreviousPage = () => {
        setActivePage(activePage - 1);
        const firstPage = getFirstPage(startPage, activePage - 1);
        setStartPage(firstPage);
        onPageChange(activePage - 1, cardCount);
    };

    const gotoLastPage = () => {
        setActivePage(totalPages);
        const firstPage = getFirstPage(startPage, totalPages);
        setStartPage(firstPage);
        onPageChange(totalPages, cardCount);
    };

    const gotoNextPage = () => {
        setActivePage(activePage + 1);
        const firstPage = getFirstPage(startPage, activePage + 1);
        setStartPage(firstPage);
        onPageChange(activePage + 1, cardCount);
    };

    return (
        <>
            <Pagination>
                <Pagination.First disabled={activePage === 1 ? true : false} onClick={gotoFirstPage} />
                <Pagination.Prev disabled={activePage === 1 ? true : false} onClick={gotoPreviousPage} />
                {pageNum.map((page, key) => {
                    return <Pagination.Item active={activePage === page ? true : false} key={key} onClick={handleSelect}>{page}</Pagination.Item>
                })}
                <Pagination.Next disabled={activePage === totalPages ? true : false} onClick={gotoNextPage} />
                <Pagination.Last disabled={activePage === totalPages ? true : false} onClick={gotoLastPage} />
            </Pagination>
            <span className="showing-no-of-records">Showing {fromToCount.from} - {fromToCount.to} of {itemsCount} records</span>
        </>
    )
}