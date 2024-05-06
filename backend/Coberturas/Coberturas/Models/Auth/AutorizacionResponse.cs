using Microsoft.VisualBasic;

namespace Coberturas.Models.Auth
{
    public class AutorizacionResponse
    {
        public string token { get; set; }   
        public bool resultado { get; set; } 
        public string msg { get; set; }   
        public Usuario ?data { get; set; }  
    }
}
