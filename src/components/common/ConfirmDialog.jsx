import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const ConfirmDialog = ({ open, title, content, onConfirm, onCancel, okText = 'Xác nhận', cancelText = 'Hủy' }) => {
    return (
        <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            {content && (
                <DialogContent>
                    <Typography>{content}</Typography>
                </DialogContent>
            )}
            <DialogActions>
                <Button onClick={onCancel} color="inherit" variant="outlined">{cancelText}</Button>
                <Button onClick={onConfirm} color="error" variant="contained">{okText}</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog; 