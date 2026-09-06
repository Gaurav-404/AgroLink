using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace dotnetapp.Exceptions
{
    public class RequestException:Exception
    {
        public RequestException(string m):base(m){}
    }
}