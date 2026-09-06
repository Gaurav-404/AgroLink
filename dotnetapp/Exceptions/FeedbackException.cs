using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace dotnetapp.Exceptions
{
    public class FeedbackException:Exception
    {
        public FeedbackException(string m):base(m){}
    }
}