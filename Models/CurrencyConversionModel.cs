namespace CurrencyConverter.Models
{
    public class CurrencyConversionModel
    {
        public decimal Amount { get; set; }
        public string FromCurrency { get; set; }
        public string ToCurrency { get; set; }
        public decimal ConvertedAmount { get; set; }
    }
}