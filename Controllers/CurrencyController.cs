using CurrencyConverter.Models;
using CurrencyConverter.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace CurrencyConverter.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CurrencyController : ControllerBase
    {
        private readonly CurrencyService _currencyService;

        public CurrencyController(CurrencyService currencyService)
        {
            _currencyService = currencyService;
        }

        [HttpGet("convert")]
        public async Task<IActionResult> ConvertCurrency([FromQuery] CurrencyConversionModel model)
        {
            var rate = await _currencyService.GetExchangeRateAsync(model.FromCurrency, model.ToCurrency);
            model.ConvertedAmount = model.Amount * rate;
            return Ok(model);
        }
    }
}