using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Net;
using Xamarin.Forms;

namespace Resume
{
    class ResumePage : ContentPage
    {
        public ResumePage()
        {
            Title = "Resume";
        }

        protected override void OnAppearing()
        {
            base.OnAppearing();

            Content = new StackLayout
            {
                VerticalOptions = LayoutOptions.Center,
                Children =
                {
                    new Label
                    {
                        XAlign = TextAlignment.Center,
                        Text = "Loading...",
                    },
                }
            };

            WebClient webClient = new WebClient();
            webClient.Encoding = Encoding.UTF8;
            webClient.DownloadStringCompleted += (s, e) =>
            {
                var text = e.Result;
                Content = new StackLayout
                {
                    VerticalOptions = LayoutOptions.Center,
                    Children =
                    {
                        new Label
                        {
                            Text = text,
                        },
                    },
                };
            };
            webClient.DownloadStringAsync(new Uri("http://swooby.com/pv/resume/resume.json"));
        }
    }
}
