using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;

namespace CurrencyConverter.Services
{
    public class CurrencyService
    {
        private readonly HttpClient _httpClient;

        public CurrencyService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<decimal> GetExchangeRateAsync(string fromCurrency, string toCurrency)
        {
            var response = await _httpClient.GetStringAsync($"https://api.exchangerate-api.com/v4/latest/{fromCurrency}");
            var data = JObject.Parse(response);
            return data["rates"][toCurrency].Value<decimal>();
        }
    }
}