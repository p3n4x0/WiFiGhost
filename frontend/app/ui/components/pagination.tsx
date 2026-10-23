import React from 'react';
import { Stack, Pagination } from '@mui/material';

interface PaginationProps {
  showPagination: boolean;
  totalItems: number;
  itemsPerPage: number;
  page: number;
  onChangePage: (event: React.ChangeEvent<unknown>, newPage: number) => void;
}

const PaginationComponent: React.FC<PaginationProps> = ({
  totalItems,
  itemsPerPage,
  page,
  onChangePage,
  showPagination,
}) => {
  if (!showPagination) return null;
  return (
    <Stack direction="row" justifyContent="center" mt={3}>
      <Pagination
        count={Math.ceil(totalItems / itemsPerPage)}
        page={page}
        onChange={onChangePage}
        shape="rounded"
        color="primary"
      />
    </Stack>
  );
};

export default PaginationComponent;
