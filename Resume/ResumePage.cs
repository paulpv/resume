using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics; 
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Net;
using Xamarin.Forms;
using RestSharp;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Linq;

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
            RefreshResume();
        }

        private async void RefreshResume()
        {
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

            var content = await GetResume();

            // Parse text in to JSON dictionary of objects
            var values = JsonConvert.DeserializeObject<Dictionary<string, object>>(content, new JsonConverter[] { new MyConverter() });

            // Build resume class from JSON dictionary of objects
            var resume = new MyResume(values);

            // TODO:(pv) Build PDF from resume class

            Content = new StackLayout
            {
                VerticalOptions = LayoutOptions.Center,
                Children =
                {
                    new Label
                    {
                        Text = content,
                    },
                },
            };
        }

        private Task<string> GetResume()
        {
            var client = new RestClient("http://swooby.com/pv/");
            var request = new RestRequest("resume/resume.json", Method.GET);
            request.RequestFormat = DataFormat.Json;

            var tcs = new TaskCompletionSource<string>();
            var asyncHandle = client.ExecuteAsync(request, response =>
            {
                if (response.ErrorException != null)
                    tcs.TrySetException(response.ErrorException);
                else
                    tcs.TrySetResult(response.Content);
            });

            return tcs.Task;
        }

        /// <summary>
        /// From http://stackoverflow.com/a/6417753
        /// </summary>
        class MyConverter : CustomCreationConverter<IDictionary<string, object>>
        {
            public override IDictionary<string, object> Create(Type objectType)
            {
                return new Dictionary<string, object>();
            }

            public override bool CanConvert(Type objectType)
            {
                // in addition to handling IDictionary<string, object>
                // we want to handle the deserialization of dict value
                // which is of type object
                return objectType == typeof(object) || base.CanConvert(objectType);
            }

            public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
            {
                if (reader.TokenType == JsonToken.StartObject
                    || reader.TokenType == JsonToken.Null)
                    return base.ReadJson(reader, objectType, existingValue, serializer);

                // if the next token is not an object
                // then fall back on standard deserializer (strings, numbers etc.)
                return serializer.Deserialize(reader);
            }
        }

        class MyResume
        {
            public string FullName { get; private set; }
            public string Email { get; private set; }
            public string Phone { get; private set; }
            public string Address { get; private set; }
            public string Resume { get; private set; }
            public string LinkedIn { get; private set; }
            public string GitHub { get; private set; }
            public string StackOverflow { get; private set; }
            public IReadOnlyDictionary<string, object> Objective { get; private set; }
            public IReadOnlyDictionary<string, object> Employment { get; private set; }
            public IReadOnlyCollection<object> Skills { get; private set; }
            public IReadOnlyDictionary<string, object> References { get; private set; }
            public IReadOnlyDictionary<string, object> Patents { get; private set; }
            public IReadOnlyDictionary<string, object> Publications { get; private set; }
            public IReadOnlyDictionary<string, object> Education { get; private set; }
            public IReadOnlyDictionary<string, object> Projects { get; private set; }
            public IReadOnlyCollection<string> Miscellaneous { get; private set; }
            public IReadOnlyCollection<string> Hobbies { get; private set; }

            public MyResume(Dictionary<string, object> values)
            {
                Process(values);
            }

            public void Process(Dictionary<string, object> values)
            {
                var objective = values["Objective"] as IDictionary<string, object>;
                Objective = new ReadOnlyDictionary<string, object>(objective);
                values.Remove("Objective");

                var employment = values["Employment"] as IDictionary<string, object>;
                Employment = new ReadOnlyDictionary<string, object>(employment);
                values.Remove("Employment");

                var skills = values["Skills"] as JArray;
                Skills = new ReadOnlyCollection<object>(skills.ToObject<List<object>>() as List<object>);
                values.Remove("Skills");

                var references = values["References"] as IDictionary<string, object>;
                References = new ReadOnlyDictionary<string, object>(references);
                values.Remove("References");

                var patents = values["Patents"] as IDictionary<string, object>;
                Patents = new ReadOnlyDictionary<string, object>(patents);
                values.Remove("Patents");
                
                var publications = values["Publications"] as IDictionary<string, object>;
                Publications = new ReadOnlyDictionary<string, object>(publications);
                values.Remove("Publications");
                
                var education = values["Education"] as IDictionary<string, object>;
                Education = new ReadOnlyDictionary<string, object>(education);
                values.Remove("Education");
                
                var projects = values["Projects"] as IDictionary<string, object>;
                Projects = new ReadOnlyDictionary<string, object>(projects);
                values.Remove("Projects");
                
                var miscellaneous = values["Miscellaneous"] as JArray;
                Miscellaneous = new ReadOnlyCollection<string>(miscellaneous.ToObject<List<string>>() as List<string>);
                values.Remove("Miscellaneous");
                
                var hobbies = values["Hobbies"] as JArray;
                Hobbies = new ReadOnlyCollection<string>(hobbies.ToObject<List<string>>() as List<string>);
                values.Remove("Hobbies");
                
                // The last KeyValuePair in the dictionary should be "Full Name": { "Email":..., "Phone":..., ... }
                FullName = values.Keys.ElementAt(0);
                var contactInfo = values[FullName] as IDictionary<string, object>;
                values.Remove(FullName);
                Email = contactInfo["Email"] as string;
                Phone = contactInfo["Phone"] as string;
                Address = contactInfo["Address"] as string;
                Resume = contactInfo["Resume"] as string;
                LinkedIn = contactInfo["LinkedIn"] as string;
                GitHub = contactInfo["GitHub"] as string;
                StackOverflow = contactInfo["StackOverflow"] as string;
            }
        }
    }
}
