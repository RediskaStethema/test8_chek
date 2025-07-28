import React, { useState, useEffect } from 'react';
import { useData } from '../state/DataContext';
import { FixedSizeList as List } from 'react-window';
import { Link } from 'react-router-dom';
import {
    TextField,
    Typography,
    Stack,
    Pagination,
    Skeleton,
    Paper,
    Alert,
} from '@mui/material';

function Items() {
    const { items, fetchItems, totalCount } = useData();
    const [q, setQ] = useState('');
    const [offset, setOffset] = useState(0);
    const [error, setError] = useState(null);
    const limit = 20;

    useEffect(() => {
        const controller = new AbortController();

        fetchItems({ q, limit, offset, signal: controller.signal })
            .then(() => setError(null))
            .catch((err) => {
                if (err.name !== 'AbortError') {
                    console.error(err);
                    setError('Error of data loading');
                }
            });

        return () => controller.abort();
    }, [q, offset, fetchItems]);

    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    return (
        <Stack spacing={2} sx={{ p: 2 }}>
            <TextField
                label="Search"
                variant="outlined"
                value={q}
                onChange={(e) => {
                    setOffset(0);
                    setQ(e.target.value);
                }}
                inputProps={{ 'aria-label': 'Search Items' }}
            />

            {error && <Alert severity="error">{error}</Alert>}

            {!items.length && !error ? (
                <Typography sx={{ mt: 2 }} variant="body1">
                    {q ? 'Not founded' : 'Loading...'}
                </Typography>
            ) : (
                <>
                    <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'hidden' }}>
                        <List height={400} itemCount={items.length} itemSize={72} width="100%">
                            {({ index, style }) => {
                                const item = items[index];
                                const noCategory = !item.category || item.category.trim() === '';

                                return (
                                    <Link
                                        to={`/items/${item.id}`}
                                        key={item.id}
                                        style={{ textDecoration: 'none', color: 'inherit' }}
                                    >
                                        <div
                                            style={{
                                                ...style,
                                                padding: '8px 16px',
                                                borderBottom: '1px solid #eee',
                                                cursor: 'pointer',
                                                backgroundColor: index % 2 === 0 ? '#fafafa' : 'white',
                                            }}
                                        >
                                            {noCategory ? (
                                                <>
                                                    <Typography variant="subtitle1">ID: {item.id}</Typography>
                                                    <Typography variant="body2" sx={{ pl: 1 }}>
                                                        Price: {item.price !== undefined ? `$${item.price}` : 'None'}
                                                    </Typography>
                                                </>
                                            ) : (
                                                <>
                                                    <Typography variant="subtitle1">{item.name || 'No name'}</Typography>
                                                    <Typography variant="body2" sx={{ pl: 1 }}>
                                                        Category: {item.category}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ pl: 1 }}>
                                                        Price: {item.price !== undefined ? `$${item.price}` : 'None'}
                                                    </Typography>
                                                </>
                                            )}
                                        </div>
                                    </Link>
                                );
                            }}
                        </List>
                    </Paper>

                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={(_, newPage) => setOffset((newPage - 1) * limit)}
                        color="primary"
                        showFirstButton
                        showLastButton
                    />
                </>
            )}
        </Stack>
    );
}

export default Items;




