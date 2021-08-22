/**
 *
 * PermissionModule
 *
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
import reducer from 'containers/PermissionModule/reducer';
import { createStructuredSelector } from 'reselect';
import saga from 'containers/PermissionModule/saga';
import Helmet from 'react-helmet';
import { FormattedMessage, useIntl } from 'react-intl';
import messages from 'containers/PermissionModule/messages';
import {
  makeIsLoadingSelector,
  makeLimitSelector,
  makePageNumberSelector,
} from 'containers/PermissionModule/selectors';
import {
  deleteItemByIdAction,
  queryPermissionAction,
  setFormMethodAction,
  setIdAction,
  setKeywordsAction,
  syncPermissionAction,
} from 'containers/PermissionModule/actions';
import SearchInput from 'components/SearchInput';
import CreatePermissionModal from 'containers/PermissionModule/createPermissionModal';
import EditPermissionModal from 'containers/PermissionModule/editPermissionModal';
import PermissionTable from 'containers/PermissionModule/permissionTable';
import { POST, PUT } from 'utils/constants';
import { Breadcrumb, Button, Modal } from 'antd';
import { ExclamationCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { NavLink } from 'react-router-dom';

const key = 'permissionModule';

const stateSelector = createStructuredSelector({
  pageNumber: makePageNumberSelector(),
  limit: makeLimitSelector(),
  isLoading: makeIsLoadingSelector(),
});

const PermissionModule = () => {
  const dispatch = useDispatch();
  const intl = useIntl();
  useInjectReducer({ key, reducer });
  useInjectSaga({ key, saga });
  const [createPermission, setCreatePermission] = useState(false);
  const [editPermission, setEditPermission] = useState(false);
  const { pageNumber, limit, isLoading } = useSelector(stateSelector);
  const onchangeFormMethod = (formMethod) =>
    dispatch(setFormMethodAction(formMethod));
  const loadPermissions = () => dispatch(queryPermissionAction());
  const onKeywordChange = (keywords) =>
    dispatch(setKeywordsAction(keywords)) && loadPermissions();
  const onCreate = () => {
    onchangeFormMethod(POST);
    setCreatePermission(true);
  };
  const onEdit = (updateId) => {
    dispatch(setIdAction(updateId));
    onchangeFormMethod(PUT);
    setEditPermission(true);
  };

  const onDelete = (deleteId) => dispatch(deleteItemByIdAction(deleteId));
  const onSync = () => dispatch(syncPermissionAction());

  useEffect(() => {
    loadPermissions();
  }, [pageNumber, limit]);

  return (
    <div className="truthy-wrapper">
      <FormattedMessage {...messages.helmetTitle}>
        {(title) => (
          <Helmet>
            <title>{title}</title>
          </Helmet>
        )}
      </FormattedMessage>
      <div className="truthy-breadcrumb">
        <h2>Permission</h2>
        <Breadcrumb>
          <Breadcrumb.Item>
            <NavLink to="/" className="links">
              Dashboard
            </NavLink>
          </Breadcrumb.Item>
          <Breadcrumb.Item className="current active">
            Permission
          </Breadcrumb.Item>
        </Breadcrumb>
      </div>
      <div className="truthy-content-header">
        <div className="d-flex align-items-center">
          <div className="add-wrap">
            <Button
              type="primary"
              icon={<SyncOutlined />}
              onClick={() => {
                Modal.confirm({
                  okText: intl.formatMessage(messages.syncOk),
                  okType: 'danger',
                  cancelText: intl.formatMessage(messages.cancelBtn),
                  icon: <ExclamationCircleOutlined />,
                  title: intl.formatMessage(messages.syncConfirmationMessage),
                  onOk: (close) => onSync() && close(),
                });
              }}
            >
              <FormattedMessage {...messages.syncLabel} />
            </Button>
          </div>
          <div className="d-flex ml-auto search-wrap">
            <SearchInput isLoading={isLoading} onSearch={onKeywordChange} />
          </div>
        </div>
      </div>
      <div className="truthy-table ">
        <PermissionTable
          onCreate={onCreate}
          onEdit={onEdit}
          onModifyPermission={() => {}}
          onDelete={onDelete}
        />
      </div>
      <CreatePermissionModal
        visible={createPermission}
        onCancel={() => setCreatePermission(false)}
        onCreate={() => setCreatePermission(false)}
      />
      <EditPermissionModal
        visible={editPermission}
        onCancel={() => setEditPermission(false)}
        onCreate={() => setEditPermission(false)}
      />
    </div>
  );
};

export default PermissionModule;
