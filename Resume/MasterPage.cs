using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Xamarin.Forms;

namespace Resume
{
    class MasterPage : ContentPage
    {
        public NavigationPage NavigationResume
        {
            get;
            private set;
        }

        public MasterPage()
        {
            NavigationResume = new NavigationPage(new ResumePage());

            Title = "Master";
            BackgroundColor = Color.Gray.WithLuminosity(0.9);
            Icon = "slideout.png";
            Content = new StackLayout
            {
                Padding = new Thickness(0, Device.OnPlatform<int>(20, 0, 0), 0, 0),
                Children =
                {
                    new Button
                    {
                        Text = "Resume",
                        Command = new Command(o =>
                        {
                            App.MasterDetailPage.Detail = NavigationResume;
                            App.MasterDetailPage.IsPresented = false;
                        }),
                    },
				}
            };
        }
    }
}
