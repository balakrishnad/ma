import { connect } from 'react-redux';
import payBills from '../../components/pay/payBills';

const mapStateToProps = state => {
  return {};
};

const mapDispatchToProps = dispatch => {
  return {};
};

const payBillsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(payBills);

export default payBillsContainer;
