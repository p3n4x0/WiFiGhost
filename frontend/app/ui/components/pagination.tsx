import React from 'react';
import { Stack, Pagination } from '@mui/material';

interface PaginationProps {
  showPagination: boolean; // Nueva prop para determinar si mostrar la paginación
  totalItems: number;
  itemsPerPage: number;
  page: number;
  onChangePage: (event: React.ChangeEvent<unknown>, newPage: number) => void;
}

const PaginationComponent: React.FC<PaginationProps> = ({ totalItems, itemsPerPage, page, onChangePage, showPagination }) => (
  <>
    {showPagination && (
      <Stack direction="row" spacing={2} justifyContent="center" mt={1}>
        <Pagination
          count={Math.ceil(totalItems / itemsPerPage)}
          page={page}
          onChange={onChangePage}
          variant="outlined"
          color="primary"
        />
      </Stack>
    )}
  </>
);

export default PaginationComponent;
