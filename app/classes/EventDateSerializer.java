package classes;

import play.*;
import models.*;
import java.util.*;
import com.google.gson.*;
import java.lang.reflect.*;
import java.text.SimpleDateFormat;

public class EventDateSerializer implements JsonSerializer<EventDateModel>{

	static EventDateSerializer instance;

	public static EventDateSerializer getInstance(){
		if(instance == null)
			instance = new EventDateSerializer();

		return instance;
	}

	@Override
	public JsonElement serialize(final EventDateModel eventDate, final Type type,
			final JsonSerializationContext context){
		final JsonObject objEvent = new JsonObject();
		final JsonArray participants = new JsonArray();
		final SimpleDateFormat formato = new SimpleDateFormat("dd/MM/yyyy");

		final String date_formated = eventDate.eventDate == null ? "" : formato.format(eventDate.eventDate);

		if(eventDate.participants != null) {
			for(UserModel user : eventDate.participants) {
				participants.add(new JsonPrimitive(user.email));
			}
		}

		objEvent.addProperty("id", eventDate.id);
		objEvent.addProperty("title", eventDate.title);
		objEvent.addProperty("description", eventDate.description);
		objEvent.addProperty("local", eventDate.local);
		objEvent.addProperty("eventdate", date_formated);
		objEvent.addProperty("eventtime", eventDate.eventTime);
		objEvent.addProperty("remind", eventDate.remind);
		objEvent.add("participants", participants);

		return objEvent;
	}

}