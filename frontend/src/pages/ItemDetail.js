import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Skeleton,
    Typography,
    Paper,
    Button,
    Stack,
    Alert,
} from '@mui/material';

function ItemDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        fetch('/api/items/' + id, { signal: controller.signal })
            .then(res => {
                if (!res.ok) return Promise.reject(new Error('Item not found'));
                return res.json();
            })
            .then(setItem)
            .catch(err => {
                if (err.name === 'AbortError') return;
                setError(err.message);
            });

        return () => controller.abort();
    }, [id]);

    if (error) {
        return (
            <Stack spacing={2} sx={{ p: 2 }}>
                <Alert severity="error">{error}</Alert>
                <Button variant="outlined" onClick={() => navigate('/')}>
                    Back
                </Button>
            </Stack>
        );
    }

    if (!item) {
        return (
            <Stack spacing={2} sx={{ p: 2 }}>
                <Skeleton  data-testid="skeleton" variant="text" width={200} height={40} />
                <Skeleton data-testid="skeleton"  variant="text" width={150} />
                <Skeleton  data-testid="skeleton"  variant="text" width={100} />
            </Stack>
        );
    }

    return (
        <Paper elevation={2} sx={{ p: 3, maxWidth: 500, margin: '0 auto' }}>
            <Typography variant="h4" gutterBottom>{item.id}</Typography>
            <Typography variant="body1"><strong>Category:</strong> {item.category}</Typography>
            <Typography variant="body1"><strong>Price:</strong> ${item.price}</Typography>
            <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate(-1)}>
                Back
            </Button>
        </Paper>
    );
}

export default ItemDetail;

