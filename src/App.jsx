import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ComingSoon from './pages/ComingSoon';

// Super Admin Pages
import SuperAdminDashboard from './pages/super-admin/SuperAdminDashboard';
import ManageCompanies from './pages/super-admin/ManageCompanies';
import RegisterCompany from './pages/super-admin/RegisterCompany';
import ManagePlans from './pages/super-admin/ManagePlans';

import CustomerMaster from './pages/customers/CustomerMaster';
import SupplierMaster from './pages/suppliers/SupplierMaster';
import BasicInfo from './pages/suppliers/BasicInfo';
import ContactAddress from './pages/suppliers/ContactAddress';
import TaxFinancial from './pages/suppliers/TaxFinancial';
import TransactionHistory from './pages/suppliers/TransactionHistory';
import Utilities from './pages/suppliers/Utilities';
import EmployeeProfile from './pages/employees/EmployeeProfile';
import JobInfo from './pages/employees/JobInfo';
import FinancialDocs from './pages/employees/FinancialDocs';
import EmployeeRecords from './pages/employees/EmployeeRecords';
import EmployeeUtilities from './pages/employees/Utilities';
import PriceList from './pages/pricelist/PriceList';
import PricingRules from './pages/pricelist/PricingRules';
import Mapping from './pages/pricelist/Mapping';
import PriceListUtilities from './pages/pricelist/Utilities';
import TaxConfig from './pages/tax/TaxConfig';
import TaxMapping from './pages/tax/TaxMapping';
import TaxUtilities from './pages/tax/TaxUtilities';
import CompanyProfile from './pages/company/CompanyProfile';
import TaxLegal from './pages/company/TaxLegal';
import BusinessSettings from './pages/company/BusinessSettings';
import BankStructure from './pages/company/BankStructure';
import CompanyStatus from './pages/company/CompanyStatus';
import BranchInfo from './pages/branch/BranchInfo';
import BranchManagement from './pages/branch/BranchManagement';
import BranchData from './pages/branch/BranchData';
import BranchUtilities from './pages/branch/BranchUtilities';
import DepartmentList from './pages/department/DepartmentList';
import AddDepartment from './pages/department/AddDepartment';
import DepartmentReportsStatus from './pages/department/DepartmentReportsStatus';
import DesignationList from './pages/designation/DesignationList';
import AddDesignation from './pages/designation/AddDesignation';
import DesignationSalaryEmployees from './pages/designation/DesignationSalaryEmployees';
import DesignationUtilities from './pages/designation/DesignationUtilities';
import ReceiptList from './pages/receipts/ReceiptList';
import NewReceipt from './pages/receipts/NewReceipt';
import PaymentList from './pages/payments/PaymentList';
import NewPayment from './pages/payments/NewPayment';
import BankReceiptList from './pages/bank-receipts/BankReceiptList';
import NewBankReceipt from './pages/bank-receipts/NewBankReceipt';
import BankPaymentList from './pages/bank-payments/BankPaymentList';
import NewBankPayment from './pages/bank-payments/NewBankPayment';
import ContraList from './pages/contra/ContraList';
import NewContra from './pages/contra/NewContra';
import AddProduct from './pages/products/AddProduct';
import Brand from './pages/products/Brand';
import Category from './pages/products/Category';
import Unit from './pages/products/Unit';
import ProductList from './pages/products/ProductList';
import AddAdjustment from './pages/products/AddAdjustment';
import AdjustmentList from './pages/products/AdjustmentList';
import StockCount from './pages/products/StockCount';
import AddPurchase from './pages/purchases/AddPurchase';
import PurchaseList from './pages/purchases/PurchaseList';
import ImportPurchaseCSV from './pages/purchases/ImportPurchaseCSV';
import PurchaseReturn from './pages/purchases/PurchaseReturn';
import AddPurchaseReturn from './pages/purchases/AddPurchaseReturn';
import AddSale from './pages/sales/AddSale';
import SaleList from './pages/sales/SaleList';
import POS from './pages/sales/POS';
import PackingSlipList from './pages/sales/PackingSlipList';
import ChallanList from './pages/sales/ChallanList';
import DriverList from './pages/sales/DriverList';
import AddDriver from './pages/sales/AddDriver';
import GiftCardList from './pages/sales/GiftCardList';
import AddGiftCard from './pages/sales/AddGiftCard';
import CouponList from './pages/sales/CouponList';
import AddCoupon from './pages/sales/AddCoupon';
import CourierList from './pages/sales/CourierList';
import AddCourier from './pages/sales/AddCourier';
import SaleReturn from './pages/sales/SaleReturn';
import AddSaleReturn from './pages/sales/AddSaleReturn';
import SaleExchangeList from './pages/sales/SaleExchangeList';
import AddSaleExchange from './pages/sales/AddSaleExchange';
import JournalList from './pages/journal/JournalList';
import NewJournal from './pages/journal/NewJournal';
import StockEntryList from './pages/stock-entry/StockEntryList';
import NewStockEntry from './pages/stock-entry/NewStockEntry';
import TransferList from './pages/stock-transfer/TransferList';
import NewTransfer from './pages/stock-transfer/NewTransfer';
import DebitNoteList from './pages/debit-note/DebitNoteList';
import NewDebitNote from './pages/debit-note/NewDebitNote';
import CreditNoteList from './pages/credit-note/CreditNoteList';
import NewCreditNote from './pages/credit-note/NewCreditNote';
import LedgerVoucherReports from './pages/reports/LedgerVoucherReports';
import FinancialReports from './pages/reports/FinancialReports';
import AnalysisReports from './pages/reports/AnalysisReports';
import StockLedgerReports from './pages/reports/StockLedgerReports';
import ProductReports from './pages/reports/ProductReports';
import ProductWiseStock from './pages/reports/stock/ProductWiseStock';
import ControlReports from './pages/reports/ControlReports';
import LowStockReport from './pages/reports/stock/LowStockReport';
import ExpiredStock from './pages/reports/stock/ExpiredStock';
import SalesSummaryReports from './pages/reports/SalesSummaryReports';
import GeneralSalesSummary from './pages/reports/sales/GeneralSalesSummary';
import SalesAnalysisReports from './pages/reports/SalesAnalysisReports';
import ProductWiseSales from './pages/reports/sales/ProductWiseSales';
import SalesFinancialReports from './pages/reports/SalesFinancialReports';
import SalesAmountReport from './pages/reports/sales/SalesAmountReport';
import TopPerformanceReports from './pages/reports/TopPerformanceReports';
import TopCustomers from './pages/reports/TopCustomers';
import SalespersonPerformance from './pages/reports/SalespersonPerformance';
import TopSellingItems from './pages/reports/sales/TopSellingItems';
import PurchaseSummaryReports from './pages/reports/PurchaseSummaryReports';
import GeneralPurchaseSummary from './pages/reports/purchases/GeneralPurchaseSummary';
import ProductWisePurchase from './pages/reports/purchases/ProductWisePurchase';
import PurchaseAmountReport from './pages/reports/purchases/PurchaseAmountReport';
import TopSuppliers from './pages/reports/purchases/TopSuppliers';
import FrequentlyPurchasedProducts from './pages/reports/purchases/FrequentlyPurchasedProducts';
import PurchasePriceComparison from './pages/reports/purchases/PurchasePriceComparison';
import PurchaseAnalysisReports from './pages/reports/PurchaseAnalysisReports';
import SupplierWisePurchase from './pages/reports/purchases/SupplierWisePurchase';
import CategoryWisePurchase from './pages/reports/purchases/CategoryWisePurchase';
import BrandWisePurchase from './pages/reports/purchases/BrandWisePurchase';
import BranchWisePurchase from './pages/reports/purchases/BranchWisePurchase';
import WarehouseWisePurchase from './pages/reports/purchases/WarehouseWisePurchase';
import PurchaseFinancialReports from './pages/reports/PurchaseFinancialReports';
import PurchaseDiscountReport from './pages/reports/purchases/PurchaseDiscountReport';
import TaxGstPaidReport from './pages/reports/purchases/TaxGstPaidReport';
import PurchaseCostReport from './pages/reports/purchases/PurchaseCostReport';
import SupplierOutstandingReport from './pages/reports/purchases/SupplierOutstandingReport';
import PaidVsPendingPurchase from './pages/reports/purchases/PaidVsPendingPurchase';
import PurchasePerformanceReports from './pages/reports/PurchasePerformanceReports';
import DayBook from './pages/day-book/DayBook';
import AccountLedger from './pages/reports/accounts/AccountLedger';
import CustomerLedger from './pages/reports/accounts/CustomerLedger';
import SupplierLedger from './pages/reports/accounts/SupplierLedger';
import CashBook from './pages/reports/accounts/CashBook';
import BankBook from './pages/reports/accounts/BankBook';
import JournalRegister from './pages/reports/accounts/JournalRegister';
import ReceiptRegister from './pages/reports/accounts/ReceiptRegister';
import PaymentRegister from './pages/reports/accounts/PaymentRegister';

import TrialBalance from './pages/reports/financial/TrialBalance';
import ProfitAndLoss from './pages/reports/financial/ProfitAndLoss';
import BalanceSheet from './pages/reports/financial/BalanceSheet';
import OutstandingReceivable from './pages/reports/financial/OutstandingReceivable';
import OutstandingPayable from './pages/reports/financial/OutstandingPayable';
import ReceivableAging from './pages/reports/financial/ReceivableAging';
import PayableAging from './pages/reports/financial/PayableAging';
import ExpenseReport from './pages/reports/financial/ExpenseReport';
import IncomeReport from './pages/reports/financial/IncomeReport';
import RecentActivities from './pages/reports/RecentActivities';
import RecentOutstandingDetails from './pages/reports/RecentOutstandingDetails';

import AccountWiseSummary from './pages/reports/analysis/AccountWiseSummary';
import DebitCreditSummary from './pages/reports/analysis/DebitCreditSummary';
import CashFlow from './pages/reports/analysis/CashFlow';
import BankBalance from './pages/reports/analysis/BankBalance';
import OpeningClosingBalance from './pages/reports/analysis/OpeningClosingBalance';

import StockSummary from './pages/reports/stock/StockSummary';
import CurrentStock from './pages/reports/stock/CurrentStock';
import OpeningStock from './pages/reports/stock/OpeningStock';
import ClosingStock from './pages/reports/stock/ClosingStock';
import StockLedger from './pages/reports/stock/StockLedger';
import StockMovement from './pages/reports/stock/StockMovement';
import StockValuation from './pages/reports/stock/StockValuation';
import WarehouseWiseStock from './pages/reports/stock/WarehouseWiseStock';
import BranchWiseStock from './pages/reports/stock/BranchWiseStock';

import ManagementDashboard from './pages/reports/mis/ManagementDashboard';
import PerformanceAnalysis from './pages/reports/mis/PerformanceAnalysis';
import BusinessAnalysis from './pages/reports/mis/BusinessAnalysis';
import KpiReports from './pages/reports/mis/KpiReports';
import GstSales from './pages/reports/gst/GstSales';
import GstPurchase from './pages/reports/gst/GstPurchase';
import TaxAnalysis from './pages/reports/gst/TaxAnalysis';
import GstReconciliation from './pages/reports/gst/Reconciliation';
import TdsSales from './pages/reports/tds/TdsSales';
import TdsPurchase from './pages/reports/tds/TdsPurchase';
import TdsTaxAnalysis from './pages/reports/tds/TaxAnalysis';
import TdsReconciliation from './pages/reports/tds/Reconciliation';
import BackupRestore from './pages/backup/BackupRestore';
import SystemSettings from './pages/setup/SystemSettings';
import GeneralSettings from './pages/setup/GeneralSettings';
import CompanyProfileSettings from './pages/setup/CompanyProfileSettings';
import TaxFinanceSettings from './pages/setup/TaxFinanceSettings';
import InventorySettings from './pages/setup/InventorySettings';
import NotificationSettings from './pages/setup/NotificationSettings';
import EmailSmsSettings from './pages/setup/EmailSmsSettings';
import PaymentGatewaySettings from './pages/setup/PaymentGatewaySettings';
import DatabaseApiSettings from './pages/setup/DatabaseApiSettings';
import SystemUtilities from './pages/setup/Utilities';
import UserMaster from './pages/setup/UserMaster';
import AddUserMaster from './pages/setup/AddUserMaster';
import RoleMaster from './pages/setup/RoleMaster';
import AddRoleMaster from './pages/setup/AddRoleMaster';
import HelpSupport from './pages/setup/HelpSupport';
import DailyAttendance from './pages/hrms/DailyAttendance';
import LeaveRequests from './pages/hrms/LeaveRequests';
import HolidayCalendar from './pages/hrms/HolidayCalendar';
import SalaryStructure from './pages/hrms/SalaryStructure';
import SalarySlips from './pages/hrms/SalarySlips';
import PfEsiReports from './pages/hrms/PfEsiReports';
import ExpenseClaims from './pages/hrms/ExpenseClaims';
import AddExpenseClaim from './pages/hrms/AddExpenseClaim';
import ExpenseLog from './pages/hrms/ExpenseLog';
import Appraisals from './pages/hrms/Appraisals';
import AddAppraisal from './pages/hrms/AddAppraisal';
import EmployeeTargets from './pages/hrms/EmployeeTargets';
import AddEmployeeTarget from './pages/hrms/AddEmployeeTarget';
import ShiftSetup from './pages/hrms/ShiftSetup';
import AddShiftSetup from './pages/hrms/AddShiftSetup';
import Login from './pages/Login';
import Register from './pages/Register';
import HrmsMasterSettings from './pages/hrms/HrmsMasterSettings';
import './App.css';

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    // Initialise default shortcuts if not exist
    const stored = localStorage.getItem('erp_shortcuts');
    if (!stored) {
      const defaultShortcuts = {
        'F1': '/coming-soon',
        'F2': '/sales/add-sale',
        'F3': '/purchases/add-purchase',
        'F4': '/receipt/new',
        'F5': '/payment/new',
        'F6': '/bank-receipt/new',
        'F7': '/bank-payment/new',
        'F8': '/journal/new',
        'F9': '/products/product-list',
        'F10': '/stock-entry/new',
        'F11': '/stock-transfer/new',
        'ctrl_l': '/reports/accounts/ledger-voucher',
        'ctrl_o': '/reports/mis/kpi-reports'
      };
      localStorage.setItem('erp_shortcuts', JSON.stringify(defaultShortcuts));
      localStorage.setItem('erp_shortcuts_enabled', 'true');
    }

    const handleKeyDown = (e) => {
      const isEnabled = localStorage.getItem('erp_shortcuts_enabled') !== 'false';
      if (!isEnabled) return;

      const currentShortcuts = JSON.parse(localStorage.getItem('erp_shortcuts') || '{}');

      const preventAndNavigate = (path) => {
        e.preventDefault();
        navigate(path);
      };

      // F-Keys
      if (currentShortcuts[e.key]) {
        preventAndNavigate(currentShortcuts[e.key]);
      } 
      // Ctrl + Key
      else if (e.ctrlKey) {
        const keyChar = e.key.toLowerCase();
        const ctrlKeyName = `ctrl_${keyChar}`;
        if (currentShortcuts[ctrlKeyName]) {
          preventAndNavigate(currentShortcuts[ctrlKeyName]);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [navigate]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Layout />}>
        {/* Admin Dashboard */}
        <Route index element={<Dashboard />} />
        
        {/* Super Admin Dashboard & Routes */}
        <Route path="super-admin" element={<SuperAdminDashboard />} />
        <Route path="super-admin/companies" element={<ManageCompanies />} />
        <Route path="super-admin/register-company" element={<RegisterCompany />} />
        <Route path="super-admin/plans" element={<ManagePlans />} />

        <Route path="customers/customer-master" element={<CustomerMaster />} />
        <Route path="suppliers/supplier-master" element={<SupplierMaster />} />
        <Route path="suppliers/basic-info" element={<SupplierMaster />} />
        <Route path="suppliers/contact-address" element={<SupplierMaster />} />
        <Route path="suppliers/tax-financial" element={<SupplierMaster />} />
        <Route path="suppliers/transaction-history" element={<SupplierMaster />} />
        <Route path="suppliers/utilities" element={<SupplierMaster />} />
        <Route path="employees/profile" element={<EmployeeProfile />} />
        <Route path="employees/job-info" element={<JobInfo />} />
        <Route path="employees/financial-docs" element={<FinancialDocs />} />
        <Route path="employees/records" element={<EmployeeRecords />} />
        <Route path="employees/utilities" element={<EmployeeUtilities />} />
        <Route path="price-list/list" element={<PriceList />} />
        <Route path="price-list/rules" element={<PricingRules />} />
        <Route path="price-list/mapping" element={<Mapping />} />
        <Route path="price-list/utilities" element={<PriceListUtilities />} />
        <Route path="tax/config" element={<TaxConfig />} />
        <Route path="tax/mapping" element={<TaxMapping />} />
        <Route path="tax/utilities" element={<TaxUtilities />} />
        <Route path="company/profile" element={<CompanyProfile />} />
        <Route path="company/tax-legal" element={<TaxLegal />} />
        <Route path="company/business-settings" element={<BusinessSettings />} />
        <Route path="company/bank-structure" element={<BankStructure />} />
        <Route path="company/status" element={<CompanyStatus />} />
        <Route path="branch/info" element={<BranchInfo />} />
        <Route path="branch/management" element={<BranchManagement />} />
        <Route path="branch/data" element={<BranchData />} />
        <Route path="branch/utilities" element={<BranchUtilities />} />
        <Route path="department/list" element={<DepartmentList />} />
        <Route path="department/add" element={<AddDepartment />} />
        <Route path="department/reports-status" element={<DepartmentReportsStatus />} />
        <Route path="designation/list" element={<DesignationList />} />
        <Route path="designation/add" element={<AddDesignation />} />
        <Route path="designation/salary-employees" element={<DesignationSalaryEmployees />} />
        <Route path="designation/utilities" element={<DesignationUtilities />} />
        <Route path="products/add-product" element={<AddProduct />} />
        <Route path="products/brand" element={<Brand />} />
        <Route path="products/category" element={<Category />} />
        <Route path="products/unit" element={<Unit />} />
        <Route path="products/product-list" element={<ProductList />} />
        <Route path="products/add-adjustment" element={<AddAdjustment />} />
        <Route path="products/adjustment-list" element={<AdjustmentList />} />
        <Route path="products/stock-count" element={<StockCount />} />
        <Route path="purchases/add-purchase" element={<AddPurchase />} />
        <Route path="purchases/purchase-list" element={<PurchaseList />} />
        <Route path="purchases/import-purchase" element={<ImportPurchaseCSV />} />
        <Route path="purchases/purchase-return" element={<PurchaseReturn />} />
        <Route path="purchases/add-purchase-return" element={<AddPurchaseReturn />} />
        <Route path="receipt/list" element={<ReceiptList />} />
        <Route path="receipt/new" element={<NewReceipt />} />
        <Route path="payment/list" element={<PaymentList />} />
        <Route path="payment/new" element={<NewPayment />} />
        <Route path="bank-receipt/list" element={<BankReceiptList />} />
        <Route path="bank-receipt/new" element={<NewBankReceipt />} />
        <Route path="bank-payment/list" element={<BankPaymentList />} />
        <Route path="bank-payment/new" element={<NewBankPayment />} />
        <Route path="contra/list" element={<ContraList />} />
        <Route path="contra/new" element={<NewContra />} />
        <Route path="journal/list" element={<JournalList />} />
        <Route path="journal/new" element={<NewJournal />} />
        <Route path="journal/edit/:id" element={<NewJournal />} />
        <Route path="stock-entry/list" element={<StockEntryList />} />
        <Route path="stock-entry/new" element={<NewStockEntry />} />
        <Route path="stock-entry/edit/:id" element={<NewStockEntry />} />
        <Route path="stock-transfer/list" element={<TransferList />} />
        <Route path="stock-transfer/new" element={<NewTransfer />} />
        <Route path="stock-transfer/edit/:id" element={<NewTransfer />} />
        <Route path="debit-note/list" element={<DebitNoteList />} />
        <Route path="debit-note/new" element={<NewDebitNote />} />
        <Route path="credit-note/list" element={<CreditNoteList />} />
        <Route path="credit-note/new" element={<NewCreditNote />} />
        <Route path="reports/accounts/ledger-voucher" element={<LedgerVoucherReports />} />
        <Route path="reports/accounts/account-ledger" element={<AccountLedger />} />
        <Route path="reports/accounts/customer-ledger" element={<CustomerLedger />} />
        <Route path="reports/accounts/supplier-ledger" element={<SupplierLedger />} />
        <Route path="reports/accounts/cash-book" element={<CashBook />} />
        <Route path="reports/accounts/bank-book" element={<BankBook />} />
        <Route path="reports/accounts/journal-register" element={<JournalRegister />} />
        <Route path="reports/accounts/receipt-register" element={<ReceiptRegister />} />
        <Route path="reports/accounts/payment-register" element={<PaymentRegister />} />
        <Route path="reports/accounts/financial" element={<FinancialReports />} />
        <Route path="reports/financial/trial-balance" element={<TrialBalance />} />
        <Route path="reports/financial/profit-and-loss" element={<ProfitAndLoss />} />
        <Route path="reports/financial/balance-sheet" element={<BalanceSheet />} />
        <Route path="reports/financial/outstanding-receivable" element={<OutstandingReceivable />} />
        <Route path="reports/financial/outstanding-payable" element={<OutstandingPayable />} />
        <Route path="reports/financial/receivable-aging" element={<ReceivableAging />} />
        <Route path="reports/financial/payable-aging" element={<PayableAging />} />
        <Route path="reports/financial/expense-report" element={<ExpenseReport />} />
        <Route path="reports/financial/income-report" element={<IncomeReport />} />
        <Route path="reports/accounts/analysis" element={<AnalysisReports />} />
        <Route path="reports/analysis/account-wise-summary" element={<AccountWiseSummary />} />
        <Route path="reports/analysis/debit-credit-summary" element={<DebitCreditSummary />} />
        <Route path="reports/analysis/cash-flow" element={<CashFlow />} />
        <Route path="reports/analysis/bank-balance" element={<BankBalance />} />
        <Route path="reports/analysis/opening-closing-balance" element={<OpeningClosingBalance />} />
        <Route path="reports/recent-activities" element={<RecentActivities />} />
        <Route path="reports/recent-outstanding-details" element={<RecentOutstandingDetails />} />
        <Route path="reports/stock/ledger" element={<StockLedgerReports />} />
        <Route path="reports/stock/stock-summary" element={<StockSummary />} />
        <Route path="reports/stock/current-stock" element={<CurrentStock />} />
        <Route path="reports/stock/opening-stock" element={<OpeningStock />} />
        <Route path="reports/stock/closing-stock" element={<ClosingStock />} />
        <Route path="reports/stock/low-stock" element={<LowStockReport />} />
        <Route path="reports/stock/expired-stock" element={<ExpiredStock />} />
        <Route path="reports/stock/stock-ledger" element={<StockLedger />} />
        <Route path="reports/stock/stock-movement" element={<StockMovement />} />
        <Route path="reports/stock/stock-valuation" element={<StockValuation />} />
        <Route path="reports/stock/warehouse-wise-stock" element={<WarehouseWiseStock />} />
        <Route path="reports/stock/branch-wise-stock" element={<BranchWiseStock />} />
        <Route path="reports/stock/product" element={<ProductReports />} />
        <Route path="reports/stock/product-wise-stock" element={<ProductWiseStock />} />
        <Route path="reports/stock/control" element={<ControlReports />} />
        <Route path="reports/stock/low-stock" element={<LowStockReport />} />
        <Route path="reports/sales/summary" element={<SalesSummaryReports />} />
        <Route path="reports/sales/general-summary" element={<GeneralSalesSummary />} />
        <Route path="reports/sales/analysis" element={<SalesAnalysisReports />} />
        <Route path="reports/sales/product-wise-sales" element={<ProductWiseSales />} />
        <Route path="reports/sales/financial" element={<SalesFinancialReports />} />
        <Route path="reports/sales/sales-amount" element={<SalesAmountReport />} />
        <Route path="reports/sales/performance" element={<TopPerformanceReports />} />
        <Route path="reports/sales/top-selling-items" element={<TopSellingItems />} />
        <Route path="reports/sales/top-customers" element={<TopCustomers />} />
        <Route path="reports/sales/salesperson-performance" element={<SalespersonPerformance />} />
        <Route path="reports/purchases/summary" element={<PurchaseSummaryReports />} />
        <Route path="reports/purchases/general-summary" element={<GeneralPurchaseSummary />} />
        <Route path="reports/purchases/product-wise-purchase" element={<ProductWisePurchase />} />
        <Route path="reports/purchases/purchase-amount" element={<PurchaseAmountReport />} />
        <Route path="reports/purchases/top-suppliers" element={<TopSuppliers />} />
        <Route path="reports/purchases/analysis" element={<PurchaseAnalysisReports />} />
        <Route path="reports/purchases/supplier-wise-purchase" element={<SupplierWisePurchase />} />
        <Route path="reports/purchases/category-wise-purchase" element={<CategoryWisePurchase />} />
        <Route path="reports/purchases/brand-wise-purchase" element={<BrandWisePurchase />} />
        <Route path="reports/purchases/branch-wise-purchase" element={<BranchWisePurchase />} />
        <Route path="reports/purchases/warehouse-wise-purchase" element={<WarehouseWisePurchase />} />
        <Route path="reports/purchases/financial" element={<PurchaseFinancialReports />} />
        <Route path="reports/purchases/discount-report" element={<PurchaseDiscountReport />} />
        <Route path="reports/purchases/tax-gst-paid" element={<TaxGstPaidReport />} />
        <Route path="reports/purchases/purchase-cost" element={<PurchaseCostReport />} />
        <Route path="reports/purchases/supplier-outstanding" element={<SupplierOutstandingReport />} />
        <Route path="reports/purchases/paid-vs-pending" element={<PaidVsPendingPurchase />} />
        <Route path="reports/purchases/performance" element={<PurchasePerformanceReports />} />
        <Route path="reports/purchases/frequently-purchased" element={<FrequentlyPurchasedProducts />} />
        <Route path="reports/purchases/price-comparison" element={<PurchasePriceComparison />} />
        <Route path="reports/mis/management-dashboard" element={<ManagementDashboard />} />
        <Route path="reports/mis/performance-analysis" element={<PerformanceAnalysis />} />
        <Route path="reports/mis/business-analysis" element={<BusinessAnalysis />} />
        <Route path="reports/mis/kpi-reports" element={<KpiReports />} />
        <Route path="reports/gst/sales" element={<GstSales />} />
        <Route path="reports/gst/purchase" element={<GstPurchase />} />
        <Route path="reports/gst/tax-analysis" element={<TaxAnalysis />} />
        <Route path="reports/gst/reconciliation" element={<GstReconciliation />} />
        <Route path="reports/tds/sales" element={<TdsSales />} />
        <Route path="reports/tds/purchase" element={<TdsPurchase />} />
        <Route path="reports/tds/tax-analysis" element={<TdsTaxAnalysis />} />
        <Route path="reports/tds/reconciliation" element={<TdsReconciliation />} />
        <Route path="day-book" element={<DayBook />} />
        <Route path="sales/add-sale" element={<AddSale />} />
        <Route path="sales/sale-list" element={<SaleList />} />
        <Route path="sales/pos" element={<POS />} />
        <Route path="sales/packing-slip-list" element={<PackingSlipList />} />
        <Route path="sales/challan-list" element={<ChallanList />} />
        <Route path="sales/driver-list" element={<DriverList />} />
        <Route path="sales/add-driver" element={<AddDriver />} />
        <Route path="sales/gift-card-list" element={<GiftCardList />} />
        <Route path="sales/add-gift-card" element={<AddGiftCard />} />
        <Route path="sales/coupon-list" element={<CouponList />} />
        <Route path="sales/add-coupon" element={<AddCoupon />} />
        <Route path="sales/courier-list" element={<CourierList />} />
        <Route path="sales/add-courier" element={<AddCourier />} />
        <Route path="sales/sale-return" element={<SaleReturn />} />
        <Route path="sales/add-sale-return" element={<AddSaleReturn />} />
        <Route path="sales/sale-exchange-list" element={<SaleExchangeList />} />
        <Route path="sales/add-sale-exchange" element={<AddSaleExchange />} />
        <Route path="setup/backup-restore" element={<BackupRestore />} />
        <Route path="setup/system-settings" element={<SystemSettings />} />
        <Route path="setup/general-settings" element={<GeneralSettings />} />
        <Route path="setup/company-profile" element={<CompanyProfileSettings />} />
        <Route path="setup/tax-finance" element={<TaxFinanceSettings />} />
        <Route path="setup/inventory-settings" element={<InventorySettings />} />
        <Route path="setup/notification-settings" element={<NotificationSettings />} />
        <Route path="setup/email-sms-settings" element={<EmailSmsSettings />} />
        <Route path="setup/payment-gateways" element={<PaymentGatewaySettings />} />
        <Route path="setup/database-api" element={<DatabaseApiSettings />} />
        {/* System Setup */}
        <Route path="setup/utilities" element={<SystemUtilities />} />
        <Route path="setup/user-master" element={<UserMaster />} />
        <Route path="setup/user-master/add" element={<AddUserMaster />} />
        <Route path="setup/role-master" element={<RoleMaster />} />
        <Route path="setup/role-master/add" element={<AddRoleMaster />} />
        <Route path="setup/help-support" element={<HelpSupport />} />
        <Route path="hrms/attendance/daily" element={<DailyAttendance />} />
        <Route path="hrms/attendance/leaves" element={<LeaveRequests />} />
        <Route path="hrms/attendance/holidays" element={<HolidayCalendar />} />
        <Route path="hrms/payroll/structure" element={<SalaryStructure />} />
        <Route path="hrms/payroll/slips" element={<SalarySlips />} />
        <Route path="hrms/payroll/pf-esi" element={<PfEsiReports />} />
        <Route path="hrms/expenses/claims" element={<ExpenseClaims />} />
        <Route path="hrms/expenses/claims/add" element={<AddExpenseClaim />} />
        <Route path="hrms/expenses/log" element={<ExpenseLog />} />
        <Route path="hrms/performance/appraisals" element={<Appraisals />} />
        <Route path="hrms/performance/appraisals/add" element={<AddAppraisal />} />
        <Route path="hrms/performance/targets" element={<EmployeeTargets />} />
        <Route path="hrms/performance/targets/add" element={<AddEmployeeTarget />} />
        <Route path="hrms/setup/shifts" element={<ShiftSetup />} />
        <Route path="hrms/setup/shifts/add" element={<AddShiftSetup />} />
        <Route path="hrms/setup/master-settings" element={<HrmsMasterSettings />} />
        <Route path="coming-soon" element={<ComingSoon />} />
        <Route path="*" element={<ComingSoon />} />
      </Route>
    </Routes>
  );
}

export default App;
