/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

/* eslint-disable react/prop-types */
import useStyles from 'isomorphic-style-loader/useStyles';
import React, {useState} from 'react';
import ReactTable from 'react-table';
import withStylesLL from 'isomorphic-style-loader/withStyles';
import {
  Box,
  Card,
  Fab,
  Table,
  TableBody,
  TablePagination,
  TableRow,
  Typography
} from "@material-ui/core";
import { compose } from 'react-apollo';
import reactTableCss from 'react-table/react-table.css';
import {useQuery} from "@apollo/react-hooks";
import AddIcon from '@material-ui/icons/Add';
import gql from "graphql-tag";
import Loading from '../../components/Loading';
import Error from '../../components/Error';
// eslint-disable-next-line css-modules/no-unused-class
import s from './Home.css';
import {roles} from "../../constants";
import Paper from "../../components/Paper";
import RemovePaper from "../../components/Paper/RemovePaper";
import EditPaper from "../../components/Paper/EditPaper";
import ViewPaper from "../../components/Paper/ViewPaper";

const CellNone = () => <div />;

const columns = (refetch) => [
  {
    Header: () => <Typography style={{fontWeight: 'bold'}}>Tiêu đề</Typography>,
    accessor: 'title',
    Cell: (props) => (
      <Typography style={{ paddingLeft: 10 }}>
        {props.value}
      </Typography>
    ),
    Aggregated: CellNone,
  },
  {
    Header: <Typography style={{fontWeight: 'bold'}}>Loại</Typography>,
    accessor: 'type',
    width: 120,
    Cell: (props) => (
      <Typography style={{ paddingLeft: 10 }}>
        {props.value}
      </Typography>
    ),
    Aggregated: CellNone,
  },
  {
    Header: <Typography style={{fontWeight: 'bold'}}>Đối tượng</Typography>,
    accessor: 'role',
    width: 120,
    style: { alignSelf: 'center' },
    Cell: (props) => {
      let result = 'Tất cả';
      if (props.value === roles.doctor) {
        result = 'Bác sĩ';
      } else if (props.value === roles.patient) {
        result = 'Bệnh nhân';
      }
      return <Typography style={{ paddingLeft: 10 }}>
        {result}
      </Typography>;
    },
  },
  {
    Header: '',
    accessor: '_id',
    width: 120,
    style: { alignSelf: 'center' },
    Cell: (props) => {
      const { _id, title, body, background, type, role } = props.original;
      return <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div style={{flex: '0 0 auto', flexBasis: 25, marginRight: 7}}>
          <ViewPaper
            title={title}
            body={body}
            background={background}
          />
        </div>
        <div style={{flex: '0 0 auto', flexBasis: 25, marginRight: 7}}>
          <EditPaper
            _id={_id}
            title={title}
            body={body}
            callback={refetch}
            background={background}
            role={role}
            type={type}
          />
        </div>
        <div style={{flex: '0 0 auto', flexBasis: 25}}>
          <RemovePaper _id={_id} title={title} callback={refetch}/>
        </div>
      </div>
    },
  },
] ;

const ROWS_PER_PAGE = 20;
const ROWS_PER_PAGE_LIST = [20, 50, 100];
const GET_PAPERS = gql(`
  query GetPapers($page: Int!, $rowsPerPage: Int, $sortBy: String) {
    getPapers(page: $page, rowsPerPage: $rowsPerPage, sortBy: $sortBy) {
      total
      items {
        _id
        type
        title
        background
        body
        role
      }
    }
  }
`)

const Groups = ({data = [], loading, columns : col}) => {
  return <ReactTable
    style={{ backgroundColor: 'white' }}
    loading={loading}
    data={data}
    columns={col}
    minRows={Math.min(data.length, 30)}
    showPagination={false}
    className="-striped -highlight"
    defaultPageSize={data.length}
  />
}

function Home() {
  useStyles(s);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE);
  const { loading, error, data, refetch,  networkStatus } = useQuery(GET_PAPERS, {
    variables: {
      page,
      rowsPerPage,
    },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  });
  const { items, total } = data ? data.getPapers : {};
  const handlePageChanged = (e, currPage) => {
    setPage(currPage + 1);
  };

  const handleChangeRowsPerPage = e => {
    const num = e.target.value || ROWS_PER_PAGE;
    setRowsPerPage(num);
  };
  const addPaper = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  }
  return (
    <div className={s.root}>
      <div className={s.container}>
        <Box display='flex' justifyContent='space-between' style={{marginTop: 10, marginBottom: 10}}>
          <h3>QUẢN LÝ THÔNG TIN Y TẾ</h3>
          <Box alignSelf="center" style={{marginRight: 20}}>
            <Fab
              size="medium"
              color="primary"
              aria-label="edit"
              className='btnEdit'
              onClick={() => {
                addPaper();
              }}
            >
              <AddIcon fontSize="small" />
            </Fab>
          </Box>
        </Box>
        <Paper open={open} handleClose={handleClose} setOpen={setOpen} callback={refetch} />
        <Card>
          <div style={{margin: 10}}>
            {(loading || networkStatus === 4) && <Loading />}
            {error && <Error error={`Error! ${error}`} />}

            {(items && networkStatus !== 4) && (
              <div>
                <Groups columns={columns(refetch)} data={items} loading={loading}/>
                <Box display="flex" justifyContent="flex-end">
                  {total ?
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TablePagination
                            page={page === 1 ? 0 : page - 1}
                            rowsPerPage={rowsPerPage || ROWS_PER_PAGE}
                            count={total || 0}
                            rowsPerPageOptions={ROWS_PER_PAGE_LIST}
                            onChangePage={handlePageChanged}
                            onChangeRowsPerPage={handleChangeRowsPerPage}
                          />
                        </TableRow>
                      </TableBody>
                    </Table> : ''
                  }
                </Box>
              </div>
            )}
          </div>
        </Card>
        </div>
    </div>
  );
}

export default compose(withStylesLL(reactTableCss))(Home);
