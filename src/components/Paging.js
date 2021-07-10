import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TablePagination,
  TableRow,
} from '@material-ui/core';
import queryString from 'query-string';
import history from '../history';

// @flow
/* eslint-disable no-unused-expressions */
type Props = {
  page: number,
  rowsPerPage: number,
  count: number,
  rowsPerPageList: any,
};

const ROWS_PER_PAGE = 20;
const ROWS_PER_PAGE_LIST = [20, 50, 100];

export function redirect(obj, removeArray, isReplace = false) {
  const query = history.location
    ? queryString.parse(history.location.search)
    : null;
  if (removeArray) {
    removeArray.map(val => delete query[val]);
  }

  const string = queryString.stringify({
    ...query,
    ...obj,
  });

  if (isReplace) {
    history.replace(`${history.location.pathname}?${string}`);
  } else {
    history.push(`${history.location.pathname}?${string}`);
  }
}

const Paging = (props: Props) => {
  const { page, rowsPerPage, count, rowsPerPageList } = props;

  const handlePageChanged = (e, currPage) => {
    redirect({
      page: currPage + 1,
    });
  };

  const handleChangeRowsPerPage = e => {
    const num = e.target.value || ROWS_PER_PAGE;
    redirect({
      rowsPerPage: num,
    });
  };

  return (
    <Box display="flex" justifyContent="flex-end">
      {count ?
        <Table>
          <TableBody>
            <TableRow>
              <TablePagination
                page={page === 1 ? 0 : page - 1}
                rowsPerPage={rowsPerPage || ROWS_PER_PAGE}
                count={count || 0}
                rowsPerPageOptions={rowsPerPageList || ROWS_PER_PAGE_LIST}
                onChangePage={handlePageChanged}
                onChangeRowsPerPage={handleChangeRowsPerPage}
              />
            </TableRow>
          </TableBody>
        </Table> : ''
      }
    </Box>
  );
};



export default Paging;
