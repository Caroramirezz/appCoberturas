namespace Coberturas.Models
{
    public class ResponseGeneral
    {
        public string msg { get; set; }
        public object ?data { get; set; }
        public bool? success { get; set; } = false;
    }
}
