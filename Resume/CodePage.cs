using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Xamarin.Forms;

namespace Resume
{
    class CodePage : ContentPage
    {
        public CodePage()
        {
            Content = new WebView
            {
                VerticalOptions = LayoutOptions.FillAndExpand,
                Source = new UrlWebViewSource
                {
                    Url = "https://github.com/paulpv/resume",
                },
            };
        }
    }
}
