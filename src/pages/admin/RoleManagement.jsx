import React, { useState, useEffect } from 'react';
import { getLocalStorage, setLocalStorage, removeLocalStorage, initialData } from '../../utils/localStorage';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    message,
    Select,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AlertPopup from '../../components/common/AlertPopup';

const ROLE_DRAFT_KEY = 'roleFormDraft';
const ROLE_LIST_KEY = 'roles';

const RoleManagement = () => {
    const [roles, setRoles] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState(null);
    const [openAlert, setOpenAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('success');

    // Load roles từ localStorage
    useEffect(() => {
        const storedRoles = getLocalStorage('roles');
        if (!storedRoles) {
            setLocalStorage('roles', initialData.roles);
            setRoles(initialData.roles);
        } else {
            setRoles(storedRoles);
        }
    }, []);

    // cho phép lưu thông tin trong localStorage
    useEffect(() => {
        if (roles.length > 0) {
            localStorage.setItem(ROLE_LIST_KEY, JSON.stringify(roles));
        }
    }, [roles]);

    // Lưu nháp khi nhập liệu
    const handleFormChange = (_, allValues) => {
        localStorage.setItem(ROLE_DRAFT_KEY, JSON.stringify(allValues));
    };

    // Xóa nháp
    const clearDraft = () => localStorage.removeItem(ROLE_DRAFT_KEY);

    const handleAdd = () => {
        setEditingId(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingId(record.id);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa vai trò này?',
            onOk: () => {
                setRoles(roles.filter(role => role.id !== id));
                setAlertMessage('Xóa vai trò thành công');
                setAlertType('success');
                setOpenAlert(true);
            },
        });
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            let newRole;
            if (editingId) {
                setRoles(prev =>
                    prev.map(role => (role.id === editingId ? { ...role, ...values, id: editingId } : role))
                );
                newRole = { ...values, id: editingId };
                setAlertMessage('Cập nhật vai trò thành công');
                setAlertType('success');
                setOpenAlert(true);
            } else {
                const newId = roles.length > 0 ? Math.max(...roles.map(r => r.id)) + 1 : 1;
                newRole = { ...values, id: newId };
                setRoles(prev => [...prev, newRole]);
                setAlertMessage('Thêm vai trò thành công');
                setAlertType('success');
                setOpenAlert(true);
            }
            form.setFieldsValue(newRole);
            setIsModalVisible(false);
        } catch (error) {
            setAlertMessage('Lưu vai trò thất bại');
            setAlertType('error');
            setOpenAlert(true);
        }
    };

    const columns = [
        {
            title: 'Chức vụ',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: '',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <span>
                    <Button
                        icon={<EditOutlined />}
                        size="small"
                        style={{ marginRight: 8 }}
                        onClick={() => handleEdit(record)}
                    />
                    <Button
                        icon={<DeleteOutlined />}
                        size="small"
                        danger
                        onClick={() => handleDelete(record.id)}
                    />
                </span>
            ),
        },
    ];

    return (
        <div>
            <div>
                <h2>Quản lý chức vụ</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    Thêm vai trò
                </Button>
            </div>
            <div>
                <Table
                    columns={columns}
                    dataSource={roles}
                    rowKey="id"
                    pagination={{ position: ['bottomCenter'] }}
                />
            </div>
            <Modal
                title={editingId ? 'Sửa vai trò' : 'Thêm vai trò'}
                open={isModalVisible}
                onOk={handleSubmit}
                onCancel={() => setIsModalVisible(false)}
            >
                <Form form={form} layout="vertical" onValuesChange={handleFormChange}>
                    <Form.Item
                        name="name"
                        label="Chức vụ"
                        rules={[{ required: true, message: 'Vui lòng nhập chức vụ!' }]}
                    >
                        <Input placeholder="Nhập tên chức vụ" />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
                    >
                        <Input.TextArea placeholder="Nhập mô tả" />
                    </Form.Item>
                </Form>
            </Modal>
            <AlertPopup open={openAlert} message={alertMessage} type={alertType} onClose={() => setOpenAlert(false)} />
        </div>
    );
};

export default RoleManagement; 