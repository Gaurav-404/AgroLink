using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace dotnetapp.Exceptions
{
    public class CropException:Exception
    {
        public CropException(string m):base(m){}
    }
}