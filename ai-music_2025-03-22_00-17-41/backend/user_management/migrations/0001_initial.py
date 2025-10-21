from django.db import migrations, models
import django.contrib.auth.models
import django.contrib.auth.validators
from django.utils import timezone
from django.conf import settings

def get_default_settings():
    return {
        'listening_habits': {
            'preferred_times': [],
            'session_duration': 0,
            'favorite_genres': []
        },
        'genre_preferences': {
            'primary': [],
            'secondary': [],
            'excluded': []
        },
        'creative_outputs': {
            'created_playlists': 0,
            'shared_content': 0,
            'collaborations': 0
        }
    }

class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('username', models.CharField(error_messages={'unique': 'A user with that username already exists.'}, help_text='Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.', max_length=150, unique=True, validators=[django.contrib.auth.validators.UnicodeUsernameValidator()], verbose_name='username')),
                ('first_name', models.CharField(blank=True, max_length=150, verbose_name='first name')),
                ('last_name', models.CharField(blank=True, max_length=150, verbose_name='last name')),
                ('email', models.EmailField(blank=True, max_length=254, verbose_name='email address')),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('date_joined', models.DateTimeField(default=timezone.now, verbose_name='date joined')),
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('language', models.CharField(choices=[('en', 'English'), ('fr', 'Français'), ('es', 'Español'), ('de', 'Deutsch'), ('zh', '中文')], default='en', help_text='User interface language preference', max_length=2)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to.', related_name='custom_user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='custom_user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'verbose_name': 'user',
                'verbose_name_plural': 'users',
                'abstract': False,
            },
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('profile_type', models.CharField(choices=[('CASUAL', 'Casual Listening'), ('PRO', 'Professional DJ Mode'), ('CUSTOM', 'Custom Profile')], default='CASUAL', max_length=20)),
                ('name', models.CharField(max_length=100)),
                ('is_public', models.BooleanField(default=False)),
                ('settings', models.JSONField(default=get_default_settings)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('collaborative_filtering_enabled', models.BooleanField(default=True, help_text='Enable collaborative filtering for this profile')),
                ('similar_users', models.JSONField(blank=True, default=dict)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='profile', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'User Profile',
                'verbose_name_plural': 'User Profiles',
                'indexes': [
                    models.Index(fields=['user', 'profile_type'], name='user_profile_user_type_idx'),
                    models.Index(fields=['is_active'], name='user_profile_active_idx'),
                ],
            },
        ),
    ] 