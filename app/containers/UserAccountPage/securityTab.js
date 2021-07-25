/**
 *
 * profileForm
 *
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Button, Form, List, Modal, Progress } from 'antd';
import FormInputWrapper from 'components/FormInputWrapper';
import commonMessages from 'common/messages';
import messages from 'containers/UserAccountPage/messages';
import { FormattedMessage, useIntl } from 'react-intl';
import { checkIfStrongPassword } from 'common/validator';
import usePasswordStrengthCheckHook from 'common/hooks/passwordStrengthHook';
import FormWrapper from 'components/FormWrapper';
import {
  clearFormAction,
  setFormValues,
  submitChangePasswordFormAction,
} from 'containers/UserAccountPage/actions';
import {
  makeErrorSelector,
  makeInitiateCleanFieldSelector,
  makeIsLoadingSelector,
} from 'containers/UserAccountPage/selectors';

const stateSelector = createStructuredSelector({
  loading: makeIsLoadingSelector(),
  errors: makeErrorSelector(),
  initiateClean: makeInitiateCleanFieldSelector(),
});

export default function SecurityTab() {
  const dispatch = useDispatch();
  const intl = useIntl();
  const [form] = Form.useForm();
  const { loading, errors, initiateClean } = useSelector(stateSelector);
  const [password, setPassword] = useState('');
  const [resetModalVisibility, setResetModalVisibility] = useState(false);
  const handleOk = async () => {
    await form.validateFields();
    dispatch(setFormValues(form.getFieldsValue()));
    dispatch(submitChangePasswordFormAction());
  };
  const handleCancel = () => {
    setResetModalVisibility(false);
    form.resetFields();
    setPassword('');
  };
  const [lowerCheck, upperCheck, numChecker, charCheck] =
    usePasswordStrengthCheckHook(password);

  const checkConfirm = (rule, value) => {
    const newPassword = form.getFieldValue('password');
    if (newPassword !== value) {
      return Promise.reject(
        new Error(intl.formatMessage(commonMessages.confirmPasswordMatchError)),
      );
    }
    return Promise.resolve();
  };

  useEffect(() => {
    if (errors?.length) {
      form.setFields(errors);
    }
  }, [errors]);

  useEffect(() => {
    if (initiateClean) {
      dispatch(clearFormAction());
      if (form) {
        form.resetFields();
      }
      setResetModalVisibility(false);
    }
  }, [initiateClean]);

  const getListItem = () => [
    {
      title: <FormattedMessage {...messages.accountPassword} />,
      description: (
        <>
          <FormattedMessage {...messages.accountPasswordDescription} />
        </>
      ),
      actions: [
        <Button type="link" onClick={() => setResetModalVisibility(true)}>
          <FormattedMessage {...messages.changeLabel} />
        </Button>,
      ],
    },
  ];

  const data = getListItem();

  return (
    <>
      <List
        itemLayout="horizontal"
        dataSource={data}
        renderItem={(item) => (
          <List.Item actions={item.actions}>
            <List.Item.Meta title={item.title} description={item.description} />
          </List.Item>
        )}
      />
      <Modal
        title="Change Password"
        visible={resetModalVisibility}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
      >
        <FormWrapper formInstance={form} name="change-password-form">
          <FormInputWrapper
            passwordInput
            label={messages.oldPasswordLabel}
            rules={[
              {
                required: true,
                whitespace: true,
                message: <FormattedMessage {...messages.oldPasswordRequired} />,
              },
            ]}
            name="oldPassword"
            id="oldPassword"
            type="password"
            placeholder={messages.oldPasswordLabel}
          />
          <FormInputWrapper
            passwordInput
            label={commonMessages.passwordPlaceHolder}
            rules={[
              {
                required: true,
                whitespace: true,
                message: (
                  <FormattedMessage {...commonMessages.passwordRequired} />
                ),
              },
              {
                validator: checkIfStrongPassword,
              },
            ]}
            name="password"
            id="password"
            type="password"
            placeholder={commonMessages.passwordPlaceHolder}
            changeHandler={(e) => setPassword(e.target.value)}
          >
            <Progress
              percent={
                ((lowerCheck + charCheck + upperCheck + numChecker) / 4) * 100
              }
              steps={4}
            />
          </FormInputWrapper>

          <FormInputWrapper
            passwordInput
            label={commonMessages.confirmPasswordLabel}
            rules={[
              {
                required: true,
                whitespace: true,
                message: (
                  <FormattedMessage
                    {...commonMessages.confirmPasswordRequired}
                  />
                ),
              },
              {
                validator: checkConfirm,
              },
            ]}
            name="confirmPassword"
            id="confirmPassword"
            type="password"
            placeholder={commonMessages.confirmPasswordLabel}
          />
        </FormWrapper>
      </Modal>
    </>
  );
}
