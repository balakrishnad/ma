import { connect } from 'react-redux';
import { makePayment } from '../../actions';
import payUSBankAccount from '../../components/pay/payUSBankAccount';

const mapStateToProps = (state) => {
  let billPay = null;
  console.log(billPay.id);
  if (state.get('paymentDetails')) {
    billPay = state.get('paymentDetails').billPay;
  }
  return {
    billPayInfo: billPay || {}
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onClick: () => {
      const obj = { id: 1 };
      dispatch(makePayment(obj));
    }
  };
};

const payUSBankAccountContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(payUSBankAccount);

export default payUSBankAccountContainer;
