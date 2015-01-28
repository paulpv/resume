using Xamarin.Forms;

namespace Resume
{
    /// <summary>
    /// Problems:
    ///     Documentation for Device.GetNamedSize(NamedSize.Medium, typeof(Label)) doesn't have second parameter:
    ///         http://developer.xamarin.com/guides/cross-platform/xamarin-forms/working-with/fonts/#Setting_Font_in_Code
    ///     Little to no mention that Android network requests must be async (not on main UI thread)
    ///     Hard to debug (ex: NetworkOnMainThreadException)
    ///     Labels are limited to 100 lines
    ///     Editor.IsEnabled = false can't be scrolled?
    ///     No Editor.ReadOnly property
    ///     MasterDetailBehavior not working?
    ///     Launcher Tile Text not working? Still show's app name text, not tile name text.
    ///     
    /// </summary>
	public class App : Application
	{
        public static MasterDetailPage MasterDetailPage
        {
            get;
            private set;
        }

		public App()
		{
            MasterPage master = new MasterPage();

            MasterDetailPage = new MasterDetailPage
            {
                Master = master,
                Detail = master.NavigationResume,
            };

            MainPage = MasterDetailPage;
		}

		protected override void OnStart()
		{
			// Handle when your app starts
		}

		protected override void OnSleep()
		{
			// Handle when your app sleeps
		}

		protected override void OnResume()
		{
			// Handle when your app resumes
		}
	}
}
