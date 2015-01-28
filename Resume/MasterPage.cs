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

        public NavigationPage NavigationSourceCode
        {
            get;
            private set;
        }

        public MasterPage()
        {
            NavigationResume = new NavigationPage(new ResumePage());

            Title = "Master";
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
                    new Button
                    {
                        Text = "Source Code",
                        Command = new Command(o =>
                        {
                            if (NavigationSourceCode == null)
                            {
                                NavigationSourceCode = new NavigationPage(new SourceCodePage());
                            }
                            App.MasterDetailPage.Detail = NavigationSourceCode;
                            App.MasterDetailPage.IsPresented = false;
                        }),
                    },
				}
            };
        }
    }
}
